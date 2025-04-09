import requests
import json
import time

# API URL'leri
BASE_URL = "http://localhost:8000/api"
LOGIN_URL = f"{BASE_URL}/auth/login/"
COURSES_URL = f"{BASE_URL}/courses/"
COURSE_DETAIL_URL = f"{BASE_URL}/courses/"  # + course_id
VIDEO_DETAIL_URL = f"{BASE_URL}/courses/videos/"  # + video_id
TRACK_VIDEO_URL = f"{BASE_URL}/courses/videos/"  # + video_id + "/track/"
QUIZ_DETAIL_URL = f"{BASE_URL}/quizzes/"  # + quiz_id
QUIZ_SUBMIT_URL = f"{BASE_URL}/quizzes/"  # + quiz_id + "/submit/"

# Test kullanıcı bilgileri
user_credentials = {
    "email": "admin@wisentia.com",  # Sistemde var olan bir kullanıcı
    "password": "Admin123!"
}

# 1. Giriş işlemi ve token alma
print("\n1. Giriş Testi")
login_response = requests.post(LOGIN_URL, json=user_credentials)
if login_response.status_code == 200:
    print("✅ Giriş başarılı")
    login_data = login_response.json()
    access_token = login_data['tokens']['access']
    headers = {"Authorization": f"Bearer {access_token}"}
else:
    print(f"❌ Giriş başarısız: {login_response.text}")
    exit(1)

# 2. Kursları listeleme
print("\n2. Kursları Listeleme Testi")
courses_response = requests.get(COURSES_URL, headers=headers)
if courses_response.status_code == 200:
    print("✅ Kurslar başarıyla listelendi")
    courses = courses_response.json()
    if len(courses) > 0:
        course_id = courses[0]['CourseID']
        print(f"İlk kurs ID: {course_id}, Başlık: {courses[0]['Title']}")
    else:
        print("❌ Kurs bulunamadı, test durduruluyor.")
        exit(1)
else:
    print(f"❌ Kursları listeleme başarısız: {courses_response.text}")
    exit(1)

# 3. Kurs detayı alma
print(f"\n3. Kurs Detayı Testi (Kurs ID: {course_id})")
course_detail_response = requests.get(f"{COURSE_DETAIL_URL}{course_id}/", headers=headers)
if course_detail_response.status_code == 200:
    print("✅ Kurs detayı başarıyla alındı")
    course_detail = course_detail_response.json()
    videos = course_detail.get('videos', [])
    if len(videos) > 0:
        video_id = videos[0]['VideoID']
        print(f"İlk video ID: {video_id}, Başlık: {videos[0]['Title']}")
    else:
        print("❌ Videolar bulunamadı, test durduruluyor.")
        exit(1)
else:
    print(f"❌ Kurs detayını alma başarısız: {course_detail_response.text}")
    exit(1)

# 4. Video detayı alma
print(f"\n4. Video Detayı Testi (Video ID: {video_id})")
video_detail_response = requests.get(f"{VIDEO_DETAIL_URL}{video_id}/", headers=headers)
if video_detail_response.status_code == 200:
    print("✅ Video detayı başarıyla alındı")
    video_detail = video_detail_response.json()
    quizzes = video_detail.get('quizzes', [])
    if len(quizzes) > 0:
        quiz_id = quizzes[0]['QuizID']
        print(f"İlk quiz ID: {quiz_id}, Başlık: {quizzes[0]['Title']}")
    else:
        print("⚠️ Bu video için quiz bulunamadı, quiz testi atlanacak.")
        quiz_id = None
else:
    print(f"❌ Video detayını alma başarısız: {video_detail_response.text}")
    exit(1)

# 5. Video ilerleme kaydı
print(f"\n5. Video İzleme İlerlemesi Testi (Video ID: {video_id})")
track_data = {
    "watchedPercentage": 100,
    "isCompleted": True
}
track_response = requests.post(f"{TRACK_VIDEO_URL}{video_id}/track/", json=track_data, headers=headers)
if track_response.status_code == 200:
    print("✅ Video izleme ilerlemesi başarıyla kaydedildi")
else:
    print(f"❌ Video izleme ilerlemesi kaydı başarısız: {track_response.text}")

# 6. Quiz detayı alma (eğer quiz varsa)
if quiz_id:
    print(f"\n6. Quiz Detayı Testi (Quiz ID: {quiz_id})")
    quiz_detail_response = requests.get(f"{QUIZ_DETAIL_URL}{quiz_id}/", headers=headers)
    if quiz_detail_response.status_code == 200:
        print("✅ Quiz detayı başarıyla alındı")
        quiz_detail = quiz_detail_response.json()
        questions = quiz_detail.get('questions', [])
        if len(questions) > 0:
            print(f"Soru sayısı: {len(questions)}")
            
            # Quiz cevaplarını hazırla
            answers = []
            for question in questions:
                question_id = question['QuestionID']
                options = question.get('options', [])
                # Basitçe ilk seçeneği doğru kabul edelim (gerçek uygulamada daha karmaşık olabilir)
                if options:
                    selected_option_id = options[0]['OptionID']
                    answers.append({
                        "questionId": question_id,
                        "selectedOptionId": selected_option_id
                    })
            
            # 7. Quiz'i yanıtlama
            print(f"\n7. Quiz Yanıtlama Testi (Quiz ID: {quiz_id})")
            submit_data = {"answers": answers}
            submit_response = requests.post(
                f"{QUIZ_DETAIL_URL}{quiz_id}/submit/", 
                json=submit_data, 
                headers=headers
            )
            if submit_response.status_code == 200:
                print("✅ Quiz başarıyla yanıtlandı")
                result = submit_response.json()
                print(f"Sonuç: {result['score']}/{result['maxScore']} - {'Başarılı' if result['passed'] else 'Başarısız'}")
            else:
                print(f"❌ Quiz yanıtlama başarısız: {submit_response.text}")
        else:
            print("⚠️ Quiz için soru bulunamadı, quiz testi atlanacak.")
    else:
        print(f"❌ Quiz detayını alma başarısız: {quiz_detail_response.text}")
    
print("\nKurs İzleme ve Quiz Tamamlama Akışı Testi Tamamlandı!")