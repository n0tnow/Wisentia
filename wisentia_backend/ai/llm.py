import requests
import json
import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# Ollama API URL
OLLAMA_API_URL = settings.OLLAMA_API_URL
LLAMA_MODEL = settings.LLAMA_MODEL

def generate_response(prompt, system_prompt=None, history=None, stream=False):
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
        
        # Timeout ayarı ile API isteği
        response = requests.post(
            f"{OLLAMA_API_URL}/chat",
            json=data,
            headers={"Content-Type": "application/json"},
            stream=stream,
            timeout=60  # 60 saniye timeout
        )
        
        if response.status_code != 200:
            logger.error(f"Ollama API hatası: {response.status_code} - {response.text}")
            return {
                'response': "Üzgünüm, şu anda isteğinizi işlemekte sorun yaşıyorum.",
                'success': False,
                'error': f"API Error: {response.status_code} - {response.text[:200]}"
            }
        
        if not stream:
            try:
                result = response.json()
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
        "Görevler ilgi çekici, net ve gerçekleştirilebilir olmalıdır."
    )
    
    user_prompt = f"""
    Aşağıdaki kriterlere göre bir görev (quest) oluştur:
    
    Zorluk seviyesi: {difficulty}
    Kategori: {category}
    Gereken puan: {points_required}
    Ödül puanı: {points_reward if points_reward else 'Otomatik hesaplanacak'}
    
    JSON formatında yanıt ver ve şu alanları içermeli:
    - title: Görev başlığı
    - description: Görev açıklaması (ilgi çekici ve motive edici olmalı)
    - conditions: En az 2, en fazla 4 koşul (görevin tamamlanması için yapılması gerekenler)
    - estimated_completion_time: Dakika cinsinden tahmini tamamlanma süresi
    
    Sadece JSON döndür, başka açıklama ekleme.
    """
    
    result = generate_response(user_prompt, system_prompt)
    
    if result['success']:
        try:
            # JSON içeriğini bul ve ayrıştır
            response_text = result['response']
            # Metinden JSON kısmını bulmaya çalış
            import re
            json_match = re.search(r'({[\s\S]*})', response_text)
            
            if json_match:
                json_str = json_match.group(1)
                quest_data = json.loads(json_str)
                return {
                    'success': True,
                    'data': quest_data
                }
            else:
                # Tüm metni JSON olarak çözmeyi dene
                quest_data = json.loads(response_text)
                return {
                    'success': True,
                    'data': quest_data
                }
        except json.JSONDecodeError as e:
            logger.error(f"JSON ayrıştırma hatası: {str(e)}, yanıt: {result['response']}")
            return {
                'success': False,
                'error': f"Oluşturulan görev JSON formatında değil: {str(e)}",
                'raw_response': result['response']
            }
    
    return {
        'success': False,
        'error': result.get('error', 'Unknown error'),
        'raw_response': result.get('response', '')
    }

def generate_quiz(video_id, video_title, video_content, num_questions=5, difficulty="intermediate"):
    """Yapay zeka ile video içeriğine dayalı quiz oluşturur"""
    system_prompt = (
        "Sen eğitim videoları için quiz soruları oluşturmaya yardımcı bir yapay zekasın. "
        "Verilen video içeriğine dayalı kısa ve etkili sorular oluşturuyorsun. "
        "Sorular, videoyu izleyenlerin temel kavramları anladıklarını test etmelidir."
    )
    
    user_prompt = f"""
    Aşağıdaki video içeriğine dayalı bir quiz oluştur:
    
    Video Başlığı: {video_title}
    Zorluk: {difficulty}
    Soru Sayısı: {num_questions}
    
    Video İçeriği:
    {video_content}
    
    JSON formatında yanıt ver ve şu yapıda olmalı:
    {{
      "title": "Quiz başlığı",
      "description": "Quiz açıklaması",
      "passing_score": 80,
      "questions": [
        {{
          "question_text": "Soru metni?",
          "question_type": "multiple_choice",
          "options": [
            {{ "text": "Seçenek 1", "is_correct": false }},
            {{ "text": "Seçenek 2", "is_correct": true }},
            {{ "text": "Seçenek 3", "is_correct": false }},
            {{ "text": "Seçenek 4", "is_correct": false }}
          ]
        }}
      ]
    }}
    
    Sadece JSON döndür, başka açıklama ekleme.
    """
    
    result = generate_response(user_prompt, system_prompt)
    
    if result['success']:
        try:
            # JSON içeriğini bul ve ayrıştır
            response_text = result['response']
            # Metinden JSON kısmını bulmaya çalış
            import re
            json_match = re.search(r'({[\s\S]*})', response_text)
            
            if json_match:
                json_str = json_match.group(1)
                quiz_data = json.loads(json_str)
                quiz_data['video_id'] = video_id
                return {
                    'success': True,
                    'data': quiz_data
                }
            else:
                # Tüm metni JSON olarak çözmeyi dene
                quiz_data = json.loads(response_text)
                quiz_data['video_id'] = video_id
                return {
                    'success': True,
                    'data': quiz_data
                }
        except json.JSONDecodeError as e:
            logger.error(f"JSON ayrıştırma hatası: {str(e)}, yanıt: {result['response']}")
            return {
                'success': False,
                'error': f"Oluşturulan quiz JSON formatında değil: {str(e)}",
                'raw_response': result['response']
            }
    
    return {
        'success': False,
        'error': result.get('error', 'Unknown error'),
        'raw_response': result.get('response', '')
    }