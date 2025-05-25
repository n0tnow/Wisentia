import requests
import json
import os
import logging
from django.conf import settings
import re
from .anthropic import generate_with_anthropic, estimate_cost
import time
import traceback

logger = logging.getLogger(__name__)

# Ollama API URL
OLLAMA_API_URL = settings.OLLAMA_API_URL
LLAMA_MODEL = settings.LLAMA_MODEL

# New simplified function to call LLM services with fallbacks
def call_llm(system_prompt, user_prompt, max_tokens=4000, temperature=0.7, timeout=1800):
    """
    Unified function to call available LLM with fallback options.
    Returns a standardized response format for all LLM calls.
    """
    logger.info("Calling LLM with system prompt and user prompt")
    
    try:
        # First try to use Anthropic Claude if API key is available
        anthropic_api_key = getattr(settings, 'ANTHROPIC_API_KEY', os.environ.get('ANTHROPIC_API_KEY'))
        if anthropic_api_key:
            logger.info("Using Anthropic Claude for generation")
            try:
                result = generate_with_anthropic(user_prompt, system_prompt)
                if isinstance(result, dict) and result.get('success') is False:
                    logger.warning(f"Claude API error: {result.get('error')}")
                    # Fall through to Ollama if Claude fails
                else:
                    # If result is a string, return it as a properly formatted response
                    if isinstance(result, str):
                        return {
                            'success': True,
                            'content': result,
                            'model': 'anthropic-claude'
                        }
                    return result
            except Exception as e:
                logger.warning(f"Claude API error: {str(e)}. Falling back to Ollama.")
        else:
            logger.warning("ANTHROPIC_API_KEY environment variable is not set. Falling back to Ollama.")
        
        # Fallback to Ollama
        logger.info(f"Using Ollama ({LLAMA_MODEL}) for generation")
        
        # Format message for Ollama
        messages = []
        if system_prompt:
            messages.append({
                "role": "system",
                "content": system_prompt
            })
        
        messages.append({
            "role": "user",
            "content": user_prompt
        })
        
        # Prepare request data
        data = {
            "model": LLAMA_MODEL,
            "messages": messages,
            "temperature": temperature,
            "stream": False
        }
        
        # Make API request with retry logic
        max_retries = 2
        retry_count = 0
        retry_delay = 5  # seconds
        
        while True:
            try:
                # Make API request with specified timeout
                response = requests.post(
                    f"{OLLAMA_API_URL}/chat",
                    json=data,
                    headers={"Content-Type": "application/json"},
                    timeout=timeout  # 30 minute timeout for complex generations
                )
                break  # If request succeeds, exit the retry loop
            except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
                retry_count += 1
                if retry_count <= max_retries:
                    logger.warning(f"Request attempt {retry_count} failed with {str(e)}. Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                    timeout *= 1.5  # Increase timeout for each retry
                else:
                    logger.error(f"All {max_retries} retry attempts failed.")
                    raise  # Re-raise the last exception
        
        if response.status_code != 200:
            logger.error(f"Ollama API error: {response.status_code} - {response.text}")
            return {
                'success': False,
                'error': f"API Error: {response.status_code} - {response.text[:200]}",
                'content': ''
            }
        
        # Parse response
        result = response.json()
        content = result.get('message', {}).get('content', '')
        
        if not content:
            logger.warning("Empty content received from Ollama")
            return {
                'success': False,
                'error': "Empty response from LLM",
                'content': ''
            }
        
        return {
            'success': True,
            'content': content,
            'model': LLAMA_MODEL
        }
        
    except Exception as e:
        logger.exception(f"Error calling LLM: {str(e)}")
        return {
            'success': False,
            'error': f"LLM call failed: {str(e)}",
            'content': ''
        }

def generate_response(prompt, system_prompt=None, history=None, stream=False, timeout=1800):
    """Llama 3 modeli ile yanıt üretir"""
    try:
        if history is None:
            history = []
        
        # Ollama'nın beklediği mesaj formatını oluştur
        messages = []
        
        # Sistem promptu ekle (varsa)
        if system_prompt:
            messages.append({
                "role": "system",
                "content": system_prompt
            })
        
        # Geçmiş mesajları ekle
        for h in history:
            role = "assistant" if h.get('is_from_ai', False) else "user"
            messages.append({
                "role": role,
                "content": h.get('content', '')
            })
        
        # Kullanıcının son mesajını ekle
        messages.append({
            "role": "user",
            "content": prompt
        })
        
        # API isteği için veri hazırla
        data = {
            "model": LLAMA_MODEL,
            "messages": messages,
            "stream": stream
        }
        
        logger.info(f"Ollama API isteği gönderiliyor: {OLLAMA_API_URL}/chat")
        
        # Retry logic for API request
        max_retries = 2
        retry_count = 0
        retry_delay = 5  # seconds
        current_timeout = timeout
        
        while True:
            try:
                # Timeout ayarı ile API isteği
                response = requests.post(
                    f"{OLLAMA_API_URL}/chat",
                    json=data,
                    headers={"Content-Type": "application/json"},
                    stream=stream,
                    timeout=current_timeout  # Dynamic timeout
                )
                break  # Success, exit retry loop
            except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
                retry_count += 1
                if retry_count <= max_retries:
                    logger.warning(f"Request attempt {retry_count} failed with {str(e)}. Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                    current_timeout *= 1.5  # Increase timeout for retry
                else:
                    # Antropic Claude ile yedek çözüm dene
                    logger.info(f"All {max_retries} retry attempts failed. Trying Anthropic Claude as fallback...")
                    try:
                        anthropic_response = generate_with_anthropic(prompt, system_prompt, history, stream)
                        return anthropic_response
                    except Exception as anthropic_error:
                        logger.error(f"Anthropic Claude yedek çözümü de başarısız: {str(anthropic_error)}")
                        raise e  # Re-raise the original exception if fallback also fails
        
        if response.status_code != 200:
            logger.error(f"Ollama API hatası: {response.status_code} - {response.text}")
            
            # Antropic Claude ile yedek çözüm dene
            try:
                logger.info("Ollama yanıt vermedi, Antropic Claude ile yeniden deneniyor...")
                anthropic_response = generate_with_anthropic(prompt, system_prompt, history, stream)
                return anthropic_response
            except Exception as anthropic_error:
                logger.error(f"Antropic Claude yedek çözümü de başarısız: {str(anthropic_error)}")
                
            return {
                'response': "Üzgünüm, şu anda isteğinizi işlemekte sorun yaşıyorum.",
                'success': False,
                'error': f"API Error: {response.status_code} - {response.text[:200]}"
            }
        
        if not stream:
            try:
                result = response.json()
                if 'message' in result and 'content' in result['message']:
                    return result['message']['content']
                else:
                    return {
                        'response': result.get('message', {}).get('content', ''),
                        'success': True
                    }
            except json.JSONDecodeError:
                # Stream yanıtını işle
                full_response = ""
                for line in response.text.splitlines():
                    if not line.strip():
                        continue
                    try:
                        chunk = json.loads(line)
                        if 'message' in chunk and 'content' in chunk['message']:
                            full_response += chunk['message']['content']
                    except json.JSONDecodeError:
                        logger.warning(f"JSON satırı işlenemedi: {line[:100]}")
                        continue
                
                if not full_response:
                    logger.warning("Boş yanıt alındı!")
                    return {
                        'response': "Üzgünüm, yanıt oluşturulamadı. Lütfen tekrar deneyin.",
                        'success': False,
                        'error': "Empty response"
                    }
                
                return {
                    'response': full_response,
                    'success': True
                }
        else:
            # Streaming için jeneratör döndür
            def generate():
                full_response = ""
                for line in response.iter_lines():
                    if line:
                        try:
                            chunk = json.loads(line)
                            if 'message' in chunk and 'content' in chunk['message']:
                                content = chunk['message']['content']
                                full_response += content
                                yield content
                        except json.JSONDecodeError as e:
                            logger.warning(f"Stream satırı işlenemedi: {line[:100]} - Hata: {e}")
                            continue
                        except Exception as e:
                            logger.error(f"Stream işleme hatası: {e}")
                            yield "Veri işlenirken bir hata oluştu."
                            break
                
                if not full_response:
                    yield "Yanıt üretilirken bir sorun oluştu."
            
            return generate()
            
    except requests.exceptions.Timeout:
        logger.error("Ollama API timeout hatası")
        error_msg = "İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin."
        
        # Antropic Claude ile yedek çözüm dene
        try:
            logger.info("Ollama timeout, Antropic Claude ile yeniden deneniyor...")
            anthropic_response = generate_with_anthropic(prompt, system_prompt, history, stream)
            return anthropic_response
        except Exception as anthropic_error:
            logger.error(f"Antropic Claude yedek çözümü de başarısız: {str(anthropic_error)}")
        
        if stream:
            def error_generator():
                yield error_msg
            return error_generator()
        else:
            return {
                'response': error_msg,
                'success': False,
                'error': "Request timeout"
            }
    except requests.exceptions.ConnectionError:
        logger.error("Ollama API bağlantı hatası")
        error_msg = "AI servisine bağlanılamıyor. Lütfen servisin çalıştığından emin olun."
        
        # Antropic Claude ile yedek çözüm dene
        try:
            logger.info("Ollama bağlantı hatası, Antropic Claude ile yeniden deneniyor...")
            anthropic_response = generate_with_anthropic(prompt, system_prompt, history, stream)
            return anthropic_response
        except Exception as anthropic_error:
            logger.error(f"Antropic Claude yedek çözümü de başarısız: {str(anthropic_error)}")
        
        if stream:
            def error_generator():
                yield error_msg
            return error_generator()
        else:
            return {
                'response': error_msg,
                'success': False,
                'error': "Connection error"
            }
    except Exception as e:
        logger.error(f"generate_response hatası: {str(e)}", exc_info=True)
        error_msg = "Üzgünüm, şu anda isteğinizi işlemekte sorun yaşıyorum."
        
        # Antropic Claude ile yedek çözüm dene
        try:
            logger.info(f"Ollama hatası: {str(e)}, Antropic Claude ile yeniden deneniyor...")
            anthropic_response = generate_with_anthropic(prompt, system_prompt, history, stream)
            return anthropic_response
        except Exception as anthropic_error:
            logger.error(f"Antropic Claude yedek çözümü de başarısız: {str(anthropic_error)}")
        
        if stream:
            def error_generator():
                yield error_msg
            return error_generator()
        else:
            return {
                'response': error_msg,
                'success': False,
                'error': str(e)
            }

def generate_quest(difficulty, category, points_required, points_reward=None):
    """Yapay zeka ile yeni quest oluşturur"""
    system_prompt = (
        "Sen görev (quest) oluşturmaya yardımcı bir yapay zekasın. Eğitim platformu için görevler "
        "oluşturuyorsun. Görevler, kullanıcıların belirli eğitim hedeflerine ulaşmasını sağlar. "
        "Görevler ilgi çekici, net ve gerçekleştirilebilir olmalıdır. "
        "SADECE geçerli JSON formatında yanıt ver, başka açıklama ekleme. "
        "JSON syntax'ına dikkat et: tüm alanlar tırnak içinde olmalı, virgüller doğru kullanılmalı."
    )
    
    user_prompt = f"""
    Aşağıdaki kriterlere göre bir görev (quest) oluştur:
    
    Zorluk seviyesi: {difficulty}
    Kategori: {category}
    Gereken puan: {points_required}
    Ödül puanı: {points_reward if points_reward else 'Otomatik hesaplanacak'}
    
    SADECE aşağıdaki formatta JSON döndür:
    {{
        "title": "Görev başlığı",
        "description": "Görev açıklaması",
        "conditions": [
            {{
                "type": "condition type",
                "name": "condition name",
                "description": "condition description",
                "points": 10
            }}
        ],
        "estimated_completion_time": 30
    }}
    
    DİKKAT: Sadece JSON döndür, başka açıklama ekleme.
    """
    
    result = generate_response(user_prompt, system_prompt)
    
    if result['success']:
        try:
            response_text = result['response']
            logger.info(f"LLM raw response: {response_text[:200]}...")
            
            # Metni temizle - başındaki ve sonundaki boşlukları kaldır
            response_text = response_text.strip()
            
            # Eğer markdown code block içindeyse, onu temizle
            if response_text.startswith('```json'):
                response_text = response_text[7:]  # ```json kısmını kaldır
            if response_text.startswith('```'):
                response_text = response_text[3:]  # ``` kısmını kaldır
            if response_text.endswith('```'):
                response_text = response_text[:-3]  # sondaki ``` kısmını kaldır
            
            # Metinden JSON kısmını bulmaya çalış
            import re
            json_match = re.search(r'(\{[\s\S]*\})', response_text)
            
            if json_match:
                json_str = json_match.group(1)
                # JSON string'i düzelt - yaygın hataları gider
                json_str = json_str.replace('\n', ' ')  # Yeni satırları boşluğa çevir
                json_str = re.sub(r',\s*}', '}', json_str)  # Sondaki virgülleri kaldır
                json_str = re.sub(r',\s*]', ']', json_str)  # Array sonundaki virgülleri kaldır
                
                try:
                    quest_data = json.loads(json_str)
                    
                    # Gerekli alanları kontrol et ve varsayılan değerler ekle
                    if 'title' not in quest_data:
                        quest_data['title'] = f"AI Quest - {category}"
                    if 'description' not in quest_data:
                        quest_data['description'] = f"Complete this {difficulty} level quest in {category}"
                    if 'conditions' not in quest_data:
                        quest_data['conditions'] = []
                    if 'estimated_completion_time' not in quest_data:
                        quest_data['estimated_completion_time'] = 30
                    
                    # Conditions'ın array olduğundan emin ol
                    if not isinstance(quest_data['conditions'], list):
                        quest_data['conditions'] = []
                    
                    return {
                        'success': True,
                        'data': quest_data
                    }
                except json.JSONDecodeError as e:
                    logger.error(f"JSON parse error after cleanup: {str(e)}")
                    logger.error(f"Cleaned JSON string: {json_str[:200]}...")
                    
                    # Fallback - basit bir quest oluştur
                    fallback_quest = {
                        'title': f"{category} Quest",
                        'description': f"Complete this {difficulty} level quest in {category} to earn {points_reward} points.",
                        'conditions': [
                            {
                                'type': 'complete',
                                'name': 'Complete Quest',
                                'description': 'Complete the quest requirements',
                                'points': points_reward or 50
                            }
                        ],
                        'estimated_completion_time': 30
                    }
                    
                    return {
                        'success': True,
                        'data': fallback_quest,
                        'warning': 'Used fallback quest due to JSON parse error'
                    }
            else:
                # JSON bulunamadı, fallback kullan
                logger.warning("No JSON found in response, using fallback")
                fallback_quest = {
                    'title': f"{category} Quest",
                    'description': f"Complete this {difficulty} level quest in {category} to earn {points_reward} points.",
                    'conditions': [
                        {
                            'type': 'complete',
                            'name': 'Complete Quest',
                            'description': 'Complete the quest requirements',
                            'points': points_reward or 50
                        }
                    ],
                    'estimated_completion_time': 30
                }
                
                return {
                    'success': True,
                    'data': fallback_quest,
                    'warning': 'No JSON found, used fallback quest'
                }
                
        except Exception as e:
            logger.error(f"Error processing quest generation: {str(e)}")
            return {
                'success': False,
                'error': f"Error processing quest: {str(e)}",
                'raw_response': result['response']
            }
    
    return {
        'success': False,
        'error': result.get('error', 'Unknown error'),
        'raw_response': result.get('response', '')
    }

def generate_quiz(video_id, video_title, video_content, num_questions=5, difficulty='intermediate', passing_score=70, language='en', target_audience='general', instructional_approach='conceptual'):
    """
    Generate a quiz based on video content.
    """
    logger.info(f"[AI] Generating quiz for video: {video_title}")
    logger.info(f"[AI] Parameters: questions={num_questions}, difficulty={difficulty}, language={language}")
    
    # Optimize prompt for faster processing
    if language == 'en':
        system_prompt = f"""You are an educational quiz creator. 
Create a quiz based on the educational content provided."""
        
        # Shorten and optimize the user prompt
        user_prompt = f"""
Content title: {video_title}
Content summary: {video_content[:2000]}

Create a quiz with the following specifications:
- {num_questions} multiple-choice questions
- Difficulty level: {difficulty}
- Target audience: {target_audience}
- Passing score: {passing_score}%
- Question language: {language}
- Instructional approach: {instructional_approach}

Format the quiz as a JSON object with this structure:
{{
  "title": "Quiz title here",
  "description": "Brief quiz description",
  "passing_score": {passing_score},
  "questions": [
    {{
      "question_text": "Question 1 text here?",
      "question_type": "multiple_choice",
      "options": [
        {{ "text": "Option 1", "is_correct": true }},
        {{ "text": "Option 2", "is_correct": false }},
        {{ "text": "Option 3", "is_correct": false }},
        {{ "text": "Option 4", "is_correct": false }}
      ]
    }}
  ]
}}
"""
    else:
        # Non-English quiz generation
        system_prompt = f"""You are an educational quiz creator. 
Create a quiz in {language} language based on the educational content provided."""
        
        # For non-English languages, we provide translated instructions
        user_prompt = f"""
Content title: {video_title}
Content summary: {video_content[:2000]}

Create a quiz with the following specifications:
- {num_questions} multiple-choice questions
- Difficulty level: {difficulty}
- Target audience: {target_audience}
- Passing score: {passing_score}%
- Question language: {language}
- Instructional approach: {instructional_approach}

Format the quiz as a JSON object with this structure:
{{
  "title": "Quiz title here in {language}",
  "description": "Brief quiz description in {language}",
  "passing_score": {passing_score},
  "questions": [
    {{
      "question_text": "Question 1 text here in {language}?",
      "question_type": "multiple_choice",
      "options": [
        {{ "text": "Option 1 in {language}", "is_correct": true }},
        {{ "text": "Option 2 in {language}", "is_correct": false }},
        {{ "text": "Option 3 in {language}", "is_correct": false }},
        {{ "text": "Option 4 in {language}", "is_correct": false }}
      ]
    }}
  ]
}}
"""

    # Optimize model parameters for faster generation
    try:
        logger.info(f"[AI] Sending LLM API request to {OLLAMA_API_URL}")
        response = requests.post(f"{OLLAMA_API_URL}/generate", 
            json={
                'model': LLAMA_MODEL,
                'prompt': f"<s>[INST] {system_prompt}\n\n{user_prompt} [/INST]",
                'stream': False,
                'temperature': 0.2,  # Lower temperature for more focused output
                'top_p': 0.9,        # Slightly restrictive sampling for faster generation
                'top_k': 40,         # Optimize top_k for faster generation
                'num_predict': 4000, # Limit token generation
                'stop': ["</s>"]     # Clear stop token
            }, 
            timeout=900  # Increased timeout for quiz generation
        )
        
        logger.info(f"[AI] LLM API response status: {response.status_code}")
        
        if response.status_code != 200:
            raise Exception(f"LLM API error: {response.status_code}, {response.text}")
        
        response_text = response.json().get('response', '')
        
        # Use more efficient JSON extraction
        return extract_and_validate_quiz_json(response_text, num_questions, passing_score, video_title)
        
    except Exception as e:
        logger.exception(f"[AI] Quiz generation error: {str(e)}")
        return {
            'success': False,
            'error': f"Failed to generate quiz: {str(e)}",
            'raw_response': str(e)
        }

def extract_and_validate_quiz_json(response_text, num_questions, passing_score, fallback_title):
    """
    Extract and validate JSON from LLM response.
    This function improves the efficiency of JSON extraction and validation.
    """
    try:
        # Try to find JSON in the response - this is more efficient than complex regex
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        
        if start_idx >= 0 and end_idx > start_idx:
            json_str = response_text[start_idx:end_idx]
            quiz_data = json.loads(json_str)
            
            # Basic validation
            if not isinstance(quiz_data, dict):
                raise ValueError("Quiz data is not a dictionary")
                
            # Ensure required fields with fallbacks
            if 'title' not in quiz_data or not quiz_data['title']:
                quiz_data['title'] = f"Quiz on {fallback_title}"
                
            if 'description' not in quiz_data or not quiz_data['description']:
                quiz_data['description'] = f"Educational quiz based on {fallback_title}"
                
            if 'passing_score' not in quiz_data or not quiz_data['passing_score']:
                quiz_data['passing_score'] = passing_score
            
            # Check for questions array
            if 'questions' not in quiz_data or not isinstance(quiz_data['questions'], list):
                raise ValueError("Quiz data does not contain a valid questions array")
                
            # Ensure we have the right number of questions, but don't waste time if close enough
            if len(quiz_data['questions']) < max(num_questions - 2, 1):
                raise ValueError(f"Quiz has too few questions: {len(quiz_data['questions'])} vs requested {num_questions}")
            
            return {
                'success': True,
                'data': quiz_data
            }
        else:
            raise ValueError("No JSON object found in response")
            
    except json.JSONDecodeError as e:
        logger.error(f"[AI] JSON decode error: {str(e)}")
        logger.error(f"[AI] Response text: {response_text[:200]}...")
        
        return {
            'success': False,
            'error': f"Failed to parse JSON: {str(e)}",
            'raw_response': response_text[:1000]
        }
        
    except Exception as e:
        logger.exception(f"[AI] Quiz extraction error: {str(e)}")
        return {
            'success': False,
            'error': f"Failed to extract quiz data: {str(e)}",
            'raw_response': response_text[:1000]
        }

def generate_quiz_with_anthropic(video_id, video_title, video_content, num_questions=5, difficulty='intermediate', passing_score=70, language='en', target_audience='general', instructional_approach='conceptual'):
    """Antropic Claude API ile quiz üretir"""
    system_prompt = """You are an educational quiz generator. Your task is to create effective, accurate quizzes based on educational content.
Generate a quiz with questions and answers that accurately test understanding of the provided content.
Your output should be valid JSON following the exact structure shown in the instructions.
"""

    # Quiz format prompt
    prompt = f"""
Based on this educational content: 

"{video_content}"

Create a quiz with {num_questions} {difficulty} questions about the content.

RULES:
- Each question should test understanding of key concepts from the content
- Questions should be {difficulty} level ({language} language)
- For multiple-choice questions, provide 4 options
- Always mark the correct answer(s)
- For true/false questions, use "True" or "False" options only
- Audience level: {target_audience}
- Instructional approach: {instructional_approach}
- Passing score: {passing_score}%

QUIZ FORMAT:
Generate a valid JSON object following EXACTLY this format:

```json
{{
  "title": "Quiz title for {video_title}",
  "description": "Description of what this quiz will test",
  "questions": [
    {{
      "question": "Question text here?",
      "type": "multiple_choice | true_false", 
      "options": [
        {{
          "text": "Option 1",
          "is_correct": false
        }},
        {{
          "text": "Option 2",
          "is_correct": true
        }},
        ...
      ]
    }},
    ...  
  ]
}}
```

Respond ONLY with the properly formatted JSON. Do not include explanations.
"""

    try:
        # Make API request to Anthropic
        result = generate_with_anthropic(prompt, system_prompt, max_tokens=4000, temperature=0.7)
        
        if not result['success']:
            return {
                'success': False,
                'error': result.get('error', 'Unknown error'),
                'raw_response': ''
            }
            
        response_text = result['response']
        
        # Extract the JSON from the response if needed
        if '```json' in response_text:
            response_text = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL).group(1)
        elif '```' in response_text:
            response_text = re.search(r'```\s*(.*?)\s*```', response_text, re.DOTALL).group(1)
            
        # Try to parse the JSON
        try:
            quiz_data = json.loads(response_text)
            
            # Standardize the field names to be consistent with generate_quiz
            # If keys are different than expected, rename them
            if 'question' in quiz_data.get('questions', [{}])[0] and 'question_text' not in quiz_data.get('questions', [{}])[0]:
                for q in quiz_data.get('questions', []):
                    if 'question' in q:
                        q['question_text'] = q.pop('question')
                    if 'type' in q:
                        q['question_type'] = q.pop('type')
            
            # Add metadata to quiz data (also done in generate_quiz)
            quiz_data['metadata'] = {
                'num_questions': num_questions,
                'difficulty': difficulty,
                'passing_score': passing_score,
                'language': language,
                'target_audience': target_audience,
                'instructional_approach': instructional_approach
            }
            
            # Calculate estimated cost
            usage = result.get('usage', {})
            cost_info = estimate_cost(usage)
            
            # Standardize by putting it in the 'data' field to match generate_quiz
            return {
                'success': True,
                'data': quiz_data,  # Use data key to match generate_quiz
                'quiz': quiz_data,  # Keep quiz key for backward compatibility
                'usage': usage,
                'cost': cost_info
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            return {
                'success': False,
                'error': f'Invalid JSON format: {str(e)}',
                'raw_response': response_text
            }
        
    except Exception as e:
        logger.error(f"generate_quiz_with_anthropic error: {str(e)}", exc_info=True)
        return {
            'success': False,
            'error': str(e),
            'raw_response': ''
        }
