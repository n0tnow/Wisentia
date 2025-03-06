# wisentia_backend kök dizininde db_test.py dosyası oluşturun
from django.db import connection

def test_connection():
    with connection.cursor() as cursor:
        # Veritabanındaki tabloları listele
        cursor.execute("""
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE='BASE TABLE'
        """)
        tables = [row[0] for row in cursor.fetchall()]
        print("Veritabanındaki tablolar:")
        for table in tables:
            print(f"- {table}")

if __name__ == "__main__":
    import os
    import django
    
    # Django ayarlarını yükle
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wisentia_backend.settings')
    django.setup()
    
    # Bağlantıyı test et
    test_connection()