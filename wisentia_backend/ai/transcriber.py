import os
import whisper
import yt_dlp
import uuid
import warnings
warnings.filterwarnings("ignore", category=UserWarning, message="FP16 is not supported on CPU*")

AUDIO_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

def download_audio(video_url):
    """Ses dosyasını audio klasörüne kaydet (.webm)"""
    filename = f"audio_{uuid.uuid4()}.webm"
    full_path = os.path.join(AUDIO_DIR, filename)

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': full_path,
        'quiet': True,
        'noplaylist': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])
        return full_path
    except Exception as e:
        raise Exception(f"Ses indirilemedi: {str(e)}")

def transcribe_audio(audio_path):
    """Whisper ile ses transkripti üretir"""
    try:
        model = whisper.load_model("base")
        result = model.transcribe(audio_path)
        return result["text"]
    except Exception as e:
        raise Exception(f"Transcript oluşturulamadı: {str(e)}")
