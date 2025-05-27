import os
import json
import requests
import logging
import time
from django.conf import settings

logger = logging.getLogger(__name__)
# Get API key from Django settings, fall back to env var
ANTHROPIC_API_KEY = getattr(settings, 'ANTHROPIC_API_KEY', os.environ.get('ANTHROPIC_API_KEY'))

CLAUDE_MODEL = "claude-3-opus-20240229"
CLAUDE_BACKUP_MODEL = "claude-3-sonnet-20240229"  # Fallback to cheaper model if needed

def is_available():
    """Check if Anthropic API is available by checking if API key is set"""
    if ANTHROPIC_API_KEY:
        return True
    else:
        logger.warning("ANTHROPIC_API_KEY not found in settings or environment.")
        return False

def generate_with_anthropic(prompt, system_prompt=None, history=None, stream=False, timeout=1800):
    """
    Claude 3 API ile yanıt üretir
    """
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
    
    logger.info(f"Claude API isteği gönderiliyor: {CLAUDE_MODEL}")
    
    # Prepare messages
    messages = []
    
    # Add previous messages from history
    if history:
        for h in history:
            role = "assistant" if h.get('is_from_ai', False) else "user"
            messages.append({
                "role": role,
                "content": h.get('content', '')
            })
    
    # Add current prompt
    messages.append({
        "role": "user",
        "content": prompt
    })
    
    # API request data
    data = {
        "model": CLAUDE_MODEL,
        "messages": messages,
        "max_tokens": 4000,
        "temperature": 0.2,  # Low temperature for more deterministic output
        "stream": stream
    }
    
    # Add system prompt if provided
    if system_prompt:
        data["system"] = system_prompt
    
    try:
        # Implement retry logic
        max_retries = 2
        retry_count = 0
        retry_delay = 5  # seconds
        current_timeout = timeout
        
        while True:
            try:
                # API request with timeout
                response = requests.post(
                    "https://api.anthropic.com/v1/messages",
                    json=data,
                    headers={
                        "Content-Type": "application/json",
                        "x-api-key": ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01"
                    },
                    stream=stream,
                    timeout=current_timeout  # 30 minute timeout
                )
                break  # Exit retry loop on success
            except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
                retry_count += 1
                if retry_count <= max_retries:
                    logger.warning(f"Anthropic request attempt {retry_count} failed with {str(e)}. Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                    current_timeout *= 1.5  # Increase timeout for retry
                else:
                    logger.error(f"All {max_retries} Anthropic retry attempts failed.")
                    raise  # Re-raise the last exception
        
        if not response.ok:
            logger.error(f"Claude API error: {response.status_code} - {response.text}")
            
            # Try with backup model if main model fails
            if CLAUDE_MODEL != CLAUDE_BACKUP_MODEL:
                logger.warning(f"Falling back to {CLAUDE_BACKUP_MODEL}")
                data["model"] = CLAUDE_BACKUP_MODEL
                
                # Implement retry logic for backup model too
                backup_retry_count = 0
                backup_retry_delay = 5
                backup_timeout = current_timeout
                
                while True:
                    try:
                        backup_response = requests.post(
                            "https://api.anthropic.com/v1/messages",
                            json=data,
                            headers={
                                "Content-Type": "application/json",
                                "x-api-key": ANTHROPIC_API_KEY,
                                "anthropic-version": "2023-06-01"
                            },
                            stream=stream,
                            timeout=backup_timeout
                        )
                        response = backup_response  # Use the backup response
                        break
                    except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
                        backup_retry_count += 1
                        if backup_retry_count <= max_retries:
                            logger.warning(f"Backup model request attempt {backup_retry_count} failed with {str(e)}. Retrying in {backup_retry_delay} seconds...")
                            time.sleep(backup_retry_delay)
                            backup_retry_delay *= 2
                            backup_timeout *= 1.5
                        else:
                            logger.error(f"All {max_retries} backup model retry attempts failed.")
                            return {
                                'response': "Sorry, I'm having trouble processing your request.",
                                'success': False,
                                'error': f"Backup API Error: {str(e)}"
                            }
                
                if not response.ok:
                    logger.error(f"Claude backup API error: {response.status_code} - {response.text}")
                    return {
                        'response': "Sorry, I'm having trouble processing your request.",
                        'success': False,
                        'error': f"API Error: {response.status_code} - {response.text[:200]}"
                    }
            else:
                return {
                    'response': "Sorry, I'm having trouble processing your request.",
                    'success': False,
                    'error': f"API Error: {response.status_code} - {response.text[:200]}"
                }
        
        if stream:
            # Implement streaming response handling
            def stream_response():
                for line in response.iter_lines():
                    if not line:
                        continue
                    
                    try:
                        chunk = json.loads(line.decode('utf-8').replace('data: ', ''))
                        if chunk.get('type') == 'content_block_delta' and chunk.get('delta', {}).get('text'):
                            yield chunk['delta']['text']
                    except Exception as e:
                        logger.error(f"Error parsing stream: {str(e)}")
                        continue
            
            return stream_response()
        else:
            result = response.json()
            
            # Extract usage information for cost tracking
            usage_info = result.get('usage', {})
            input_tokens = usage_info.get('input_tokens', 0)
            output_tokens = usage_info.get('output_tokens', 0)
            
            # Calculate cost
            cost_info = None
            if input_tokens > 0 or output_tokens > 0:
                cost_info = estimate_cost({
                    "input": input_tokens,
                    "output": output_tokens
                }, data.get("model", CLAUDE_MODEL))
            
            # Extract the content from Claude's response
            if 'content' in result and len(result['content']) > 0:
                content_blocks = [block for block in result['content'] if block['type'] == 'text']
                if content_blocks:
                    text_content = ''.join([block['text'] for block in content_blocks])
                    
                    # Return structured response with cost information
                    return {
                        'success': True,
                        'content': text_content,
                        'model': data.get("model", CLAUDE_MODEL),
                        'usage': {
                            'input_tokens': input_tokens,
                            'output_tokens': output_tokens
                        },
                        'cost': cost_info
                    }
                else:
                    logger.warning("No text content in Claude response")
                    return {
                        'response': "I wasn't able to generate a proper response.",
                        'success': False,
                        'error': "No text content"
                    }
            else:
                logger.warning("Empty content in Claude response")
                return {
                    'response': "I wasn't able to generate a proper response.",
                    'success': False,
                    'error': "Empty content"
                }
    
    except requests.exceptions.Timeout:
        logger.error("Claude API timeout")
        return {
            'response': "The request timed out. Please try again later.",
            'success': False,
            'error': "Request timeout"
        }
    
    except requests.exceptions.ConnectionError:
        logger.error("Claude API connection error")
        return {
            'response': "Couldn't connect to the AI service. Please try again later.",
            'success': False,
            'error': "Connection error"
        }
    
    except Exception as e:
        logger.error(f"Claude API error: {str(e)}", exc_info=True)
        return {
            'response': "An error occurred while processing your request.",
            'success': False,
            'error': str(e)
        }

def estimate_cost(tokens, model=CLAUDE_MODEL):
    """
    Claude API kullanım maliyetini tahmin eder
    """
    # Current pricing as of May 2024 (per 1M tokens)
    pricing = {
        "claude-3-opus-20240229": {"input": 15, "output": 75},
        "claude-3-sonnet-20240229": {"input": 3, "output": 15},
        "claude-3-haiku-20240307": {"input": 0.25, "output": 1.25}
    }
    
    if model not in pricing:
        return {"error": f"Unknown model: {model}"}
    
    # Simple estimation based on token count
    input_cost = (tokens["input"] / 1000000) * pricing[model]["input"]
    output_cost = (tokens["output"] / 1000000) * pricing[model]["output"]
    total_cost = input_cost + output_cost
    
    return {
        "input_tokens": tokens["input"],
        "output_tokens": tokens["output"],
        "input_cost": input_cost,
        "output_cost": output_cost,
        "total_cost": total_cost,
        "currency": "USD"
    } 