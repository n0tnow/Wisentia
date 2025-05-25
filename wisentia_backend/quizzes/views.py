from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import logging

# Configure logger
logger = logging.getLogger('wisentia')

# Database connection function (sadece Django connection kullan)
def get_db_connection():
    return connection

# Helper to safely execute database operations with proper error handling
def execute_db_query(query, params=None, fetch_one=False, fetch_all=True, error_msg="Database error"):
    db_conn = get_db_connection()
    cursor = None
    try:
        cursor = db_conn.cursor()
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        if cursor.description:
            columns = [col[0] for col in cursor.description]
            if fetch_one:
                row = cursor.fetchone()
                if row:
                    return {'row': row, 'columns': columns}
                return None
            elif fetch_all:
                rows = cursor.fetchall()
                return {'rows': rows, 'columns': columns}
        else:
            return cursor.rowcount
    except Exception as e:
        logger.error(f"{error_msg}: {str(e)}")
        raise Exception(f"{error_msg}: {str(e)}")
    finally:
        if cursor:
            try:
                cursor.close()
            except:
                pass

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quiz_detail(request, quiz_id):
    """API endpoint to retrieve quiz details and questions"""
    try:
        user_id = request.user.id
        
        # Get quiz information with support for both video-specific and course-specific quizzes
        query = """
            SELECT q.QuizID, q.Title, q.Description, q.PassingScore, 
                   q.VideoID, q.CourseID, q.IsActive
            FROM Quizzes q
            WHERE q.QuizID = %s
        """
        
        quiz_result = execute_db_query(
            query, 
            params=[quiz_id], 
            fetch_one=True, 
            error_msg=f"Error fetching quiz details for quiz_id {quiz_id}"
        )
        
        if not quiz_result:
            return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
            
        quiz = dict(zip(quiz_result['columns'], quiz_result['row']))
        video_id = quiz.get('VideoID')
        course_id = quiz.get('CourseID')
        
        # Log for debugging
        logger.info(f"Quiz details retrieved for quiz_id {quiz_id}: {quiz}")
        
        # Get related video information if VideoID is present
        if video_id:
            video_query = """
                SELECT cv.VideoID, cv.Title as VideoTitle, cv.CourseID, c.Title as CourseTitle,
                       cv.YouTubeVideoID
                FROM CourseVideos cv
                JOIN Courses c ON cv.CourseID = c.CourseID
                WHERE cv.YouTubeVideoID = %s
            """
            
            video_result = execute_db_query(
                video_query, 
                params=[video_id], 
                fetch_one=True, 
                error_msg=f"Error fetching video details for video_id {video_id}"
            )
            
            if video_result:
                video_info = dict(zip(video_result['columns'], video_result['row']))
                quiz['video'] = video_info
                quiz['course'] = {
                    'CourseID': video_info['CourseID'],
                    'Title': video_info['CourseTitle']
                }
        
        # Get course information if CourseID is present but no VideoID
        elif course_id:
            course_query = """
                SELECT c.CourseID, c.Title
                FROM Courses c
                WHERE c.CourseID = %s
            """
            
            course_result = execute_db_query(
                course_query, 
                params=[course_id], 
                fetch_one=True, 
                error_msg=f"Error fetching course details for course_id {course_id}"
            )
            
            if course_result:
                course_info = dict(zip(course_result['columns'], course_result['row']))
                quiz['course'] = course_info
                
        # Get questions
        questions_query = """
            SELECT qq.QuestionID, qq.QuestionText, qq.QuestionType, qq.OrderInQuiz
            FROM QuizQuestions qq
            WHERE qq.QuizID = %s
            ORDER BY qq.OrderInQuiz, qq.QuestionID
        """
        
        questions_result = execute_db_query(
            questions_query, 
            params=[quiz_id], 
            error_msg=f"Error fetching questions for quiz_id {quiz_id}"
        )
        
        # Log for debugging
        logger.info(f"Quiz questions query result for quiz_id {quiz_id}: {questions_result}")
        
        # Get previous attempts
        attempts_query = """
            SELECT uqa.AttemptID, uqa.Score, uqa.MaxScore, uqa.AttemptDate, uqa.Passed, uqa.EarnedPoints
            FROM UserQuizAttempts uqa
            WHERE uqa.UserID = %s AND uqa.QuizID = %s
            ORDER BY uqa.AttemptDate DESC
        """
        
        attempts_result = execute_db_query(
            attempts_query, 
            params=[user_id, quiz_id], 
            error_msg=f"Error fetching user attempts for quiz_id {quiz_id}"
        )
        
        # Format response
        questions = []
        if questions_result and questions_result['rows']:
            for q_row in questions_result['rows']:
                question = dict(zip(questions_result['columns'], q_row))
                
                # Get options for this question
                options_query = """
                    SELECT qo.OptionID, qo.OptionText, qo.OrderInQuestion, qo.IsCorrect
                    FROM QuestionOptions qo
                    WHERE qo.QuestionID = %s
                    ORDER BY qo.OrderInQuestion
                """
                
                options_result = execute_db_query(
                    options_query, 
                    params=[question['QuestionID']], 
                    error_msg=f"Error fetching options for question_id {question['QuestionID']}"
                )
                
                # Add options to question
                question['options'] = []
                if options_result and options_result['rows']:
                    for o_row in options_result['rows']:
                        option = dict(zip(options_result['columns'], o_row))
                        # For security, don't send IsCorrect to the client in quiz details
                        if 'IsCorrect' in option:
                            del option['IsCorrect']
                        question['options'].append(option)
                
                questions.append(question)
                
                # Log for debugging
                logger.info(f"Added question: {question['QuestionID']} with {len(question['options'])} options")
        else:
            logger.warning(f"No questions found for quiz_id {quiz_id}")
        
        # Format attempts
        attempts = []
        if attempts_result and attempts_result['rows']:
            for a_row in attempts_result['rows']:
                attempt = dict(zip(attempts_result['columns'], a_row))
                
                # Convert to readable format
                if attempt['Score'] is not None:
                    attempt['Score'] = float(attempt['Score'])
                if attempt['MaxScore'] is not None:
                    attempt['MaxScore'] = float(attempt['MaxScore'])
                attempt['Passed'] = bool(attempt['Passed'])
                
                attempts.append(attempt)
        
        # Add to response
        quiz['questions'] = questions
        quiz['userAttempts'] = attempts
        
        # Final debug log
        logger.info(f"Returning quiz with {len(questions)} questions and {len(attempts)} attempts")
    
    except Exception as e:
        logger.error(f"Error in quiz_detail: {str(e)}")
        return Response(
            {'error': 'An error occurred while retrieving quiz details', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    return Response(quiz)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request, quiz_id):
    """API endpoint to submit a completed quiz and score it"""
    try:
        user_id = request.user.id
        
        # Validate request data
        if not request.data or not isinstance(request.data.get('answers'), list):
            return Response(
                {'error': 'Invalid request format. Answers must be provided as a list.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # First, verify the quiz exists
        quiz_query = """
            SELECT q.QuizID, q.Title, q.Description, q.PassingScore, q.VideoID, q.CourseID
            FROM Quizzes q
            WHERE q.QuizID = %s AND q.IsActive = 1
        """
        
        quiz_result = execute_db_query(
            quiz_query, 
            params=[quiz_id], 
            fetch_one=True, 
            error_msg=f"Error fetching quiz data for quiz_id {quiz_id}"
        )
        
        if not quiz_result:
            return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
            
        quiz = dict(zip(quiz_result['columns'], quiz_result['row']))
        
        # Get all questions for this quiz
        questions_query = """
            SELECT q.QuestionID, q.QuestionType
            FROM QuizQuestions q
            WHERE q.QuizID = %s
        """
        
        questions_result = execute_db_query(
            questions_query, 
            params=[quiz_id], 
            error_msg=f"Error fetching questions for quiz_id {quiz_id}"
        )
        
        if not questions_result or not questions_result['rows']:
            return Response(
                {'error': 'This quiz has no questions'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        questions = []
        for q_row in questions_result['rows']:
            questions.append(dict(zip(questions_result['columns'], q_row)))
        
        # Map question IDs to types for easier lookup
        question_types = {q['QuestionID']: q['QuestionType'] for q in questions}
        
        # Get all correct options for scoring
        correct_options_query = """
            SELECT qo.QuestionID, qo.OptionID
            FROM QuestionOptions qo
            WHERE qo.QuestionID IN (
                SELECT QuestionID FROM QuizQuestions WHERE QuizID = %s
            ) AND qo.IsCorrect = 1
        """
        
        correct_options_result = execute_db_query(
            correct_options_query, 
            params=[quiz_id], 
            error_msg=f"Error fetching correct options for quiz_id {quiz_id}"
        )
        
        correct_options = {}
        if correct_options_result:
            for co_row in correct_options_result['rows']:
                option = dict(zip(correct_options_result['columns'], co_row))
                question_id = option['QuestionID']
                if question_id not in correct_options:
                    correct_options[question_id] = []
                correct_options[question_id].append(option['OptionID'])
        
        # Score the quiz
        submitted_answers = request.data.get('answers', [])
        total_questions = len(questions)
        correct_count = 0
        scores = []
        
        # Log submitted answers for debugging
        logger.info(f"Processing {len(submitted_answers)} submitted answers for quiz_id {quiz_id}")
        logger.info(f"Submitted answers: {submitted_answers}")
        
        # Track which answers were correct
        answer_results = {}
        
        for answer in submitted_answers:
            question_id = answer.get('questionId')
            selected_option_id = answer.get('selectedOptionId')
            text_answer = answer.get('textAnswer')
            
            # Log each answer being processed
            logger.info(f"Processing answer for question_id {question_id}: selected_option_id={selected_option_id}, text_answer={text_answer}")
            
            # Skip invalid answers
            if not question_id or question_id not in question_types:
                logger.warning(f"Skipping invalid question_id: {question_id}")
                continue
            
            # Check if answer is correct
            is_correct = False
            
            if question_types[question_id] == 'multiple_choice' or question_types[question_id] == 'true_false':
                # For multiple choice and true/false, check if selected option is in the list of correct options
                if question_id in correct_options and selected_option_id in correct_options[question_id]:
                    is_correct = True
                    correct_count += 1
                    logger.info(f"Correct answer for question_id {question_id}")
                else:
                    logger.info(f"Incorrect answer for question_id {question_id}")
            elif question_types[question_id] == 'short_answer':
                # For short answer questions, we would need a more sophisticated comparison
                # For now, just mark as incorrect
                is_correct = False
                logger.info(f"Short answer for question_id {question_id} marked as incorrect by default")
            
            # Save result for this question
            answer_results[question_id] = {
                'isCorrect': is_correct,
                'selectedOptionId': selected_option_id,
                'textAnswer': text_answer
            }
            
            scores.append({
                'questionId': question_id,
                'isCorrect': is_correct
            })
        
        # Calculate final score
        score_percentage = (correct_count / total_questions) * 100 if total_questions > 0 else 0
        passed = score_percentage >= quiz['PassingScore']
        
        logger.info(f"Quiz scoring complete. Score: {score_percentage}%, Passing: {passed}")
        
        # Save attempt in database
        attempt_query = """
            INSERT INTO UserQuizAttempts (UserID, QuizID, Score, MaxScore, AttemptDate, Passed, EarnedPoints)
            VALUES (%s, %s, %s, %s, GETDATE(), %s, %s)
            SELECT SCOPE_IDENTITY() as AttemptID
        """
        
        # Calculate earned points
        earned_points = 10 # Base points for attempt
        if passed:
            earned_points += 20 # Bonus for passing
            if score_percentage >= 90:
                earned_points += 10 # Bonus for high score
        
        attempt_result = execute_db_query(
            attempt_query, 
            params=[
                user_id, 
                quiz_id, 
                score_percentage, 
                100, # Max score is always 100%
                1 if passed else 0, 
                earned_points
            ], 
            fetch_one=True,
            error_msg=f"Error saving quiz attempt for user_id {user_id}, quiz_id {quiz_id}"
        )
        
        if not attempt_result:
            return Response(
                {'error': 'Failed to save quiz attempt'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        attempt_id = attempt_result['row'][0]
        
        # Save individual answers
        for question_id, result in answer_results.items():
            answer_query = """
                INSERT INTO UserQuizAnswers (AttemptID, QuestionID, SelectedOptionID, TextAnswer, IsCorrect)
                VALUES (%s, %s, %s, %s, %s)
            """
            
            # Correctly handle the parameters, especially NULL values
            selected_option_id = None if result['selectedOptionId'] is None else int(result['selectedOptionId'])
            text_answer = result['textAnswer'] if result['textAnswer'] else None
            is_correct = 1 if result['isCorrect'] else 0
            
            try:
                logger.info(f"Saving answer: AttemptID={attempt_id}, QuestionID={question_id}, " +
                           f"SelectedOptionID={selected_option_id}, TextAnswer={text_answer}, IsCorrect={is_correct}")
                
                execute_db_query(
                    answer_query, 
                    params=[
                        attempt_id, 
                        question_id, 
                        selected_option_id, 
                        text_answer, 
                        is_correct
                    ], 
                    fetch_all=False,
                    error_msg=f"Error saving answer for attempt_id {attempt_id}, question_id {question_id}"
                )
                
                logger.info(f"Successfully saved answer for question_id {question_id}")
            except Exception as e:
                logger.error(f"Failed to save answer for question_id {question_id}: {str(e)}")
                # Continue with other answers even if one fails
        
        # Return the results
        return Response({
            'attemptId': attempt_id,
            'score': score_percentage,
            'passed': passed,
            'earnedPoints': earned_points,
            'questionResults': scores
        })
        
    except Exception as e:
        logger.error(f"Error in submit_quiz: {str(e)}")
        return Response(
            {'error': 'An error occurred while submitting the quiz', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quiz_results(request, attempt_id):
    """Quiz deneme sonuçlarını gösteren API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Denemeyi kontrol et
        cursor.execute("""
            SELECT ua.AttemptID, ua.QuizID, ua.Score, ua.MaxScore, 
                   ua.AttemptDate, ua.Passed, ua.EarnedPoints,
                   q.Title as QuizTitle, q.PassingScore
            FROM UserQuizAttempts ua
            JOIN Quizzes q ON ua.QuizID = q.QuizID
            WHERE ua.AttemptID = %s AND ua.UserID = %s
        """, [attempt_id, user_id])
        
        columns = [col[0] for col in cursor.description]
        attempt_data = cursor.fetchone()
        
        if not attempt_data:
            return Response({'error': 'Quiz attempt not found'}, status=status.HTTP_404_NOT_FOUND)
            
        attempt = dict(zip(columns, attempt_data))
        quiz_id = attempt['QuizID']
        
        # Sorular ve kullanıcı cevaplarını al
        cursor.execute("""
            SELECT qq.QuestionID, qq.QuestionText, qq.QuestionType, qq.OrderInQuiz,
                   uqa.SelectedOptionID, uqa.TextAnswer, uqa.IsCorrect
            FROM QuizQuestions qq
            LEFT JOIN UserQuizAnswers uqa ON qq.QuestionID = uqa.QuestionID AND uqa.AttemptID = %s
            WHERE qq.QuizID = %s
            ORDER BY qq.OrderInQuiz
        """, [attempt_id, quiz_id])
        
        columns = [col[0] for col in cursor.description]
        questions = []
        
        for row in cursor.fetchall():
            question = dict(zip(columns, row))
            question_id = question['QuestionID']
            
            # Tüm seçenekleri al
            cursor.execute("""
                SELECT OptionID, OptionText, IsCorrect, OrderInQuestion
                FROM QuestionOptions
                WHERE QuestionID = %s
                ORDER BY OrderInQuestion
            """, [question_id])
            
            option_columns = [col[0] for col in cursor.description]
            options = [dict(zip(option_columns, option_row)) for option_row in cursor.fetchall()]
            
            question['options'] = options
            questions.append(question)
        
        attempt['questions'] = questions
    
    return Response(attempt)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def video_quizzes(request, video_id):
    """API endpoint to retrieve quizzes associated with a video"""
    try:
        user_id = request.user.id
        
        # First, verify the video exists and get basic info
        video_query = """
            SELECT cv.VideoID, cv.Title, cv.Description, cv.Duration, cv.CourseID,
                   cv.YouTubeVideoID, cv.OrderInCourse
            FROM CourseVideos cv
            WHERE cv.VideoID = %s
        """
        
        video_result = execute_db_query(
            video_query, 
            params=[video_id], 
            fetch_one=True, 
            error_msg=f"Error fetching video data for video_id {video_id}"
        )
        
        if not video_result:
            return Response({'error': 'Video not found'}, status=status.HTTP_404_NOT_FOUND)
        
        video = dict(zip(video_result['columns'], video_result['row']))
        
        # Get user's video progress
        progress_query = """
            SELECT uvv.ViewID, uvv.WatchedPercentage, uvv.IsCompleted, 
                   uvv.ViewDate, uvv.EarnedPoints, uvv.lastPosition
            FROM UserVideoViews uvv
            WHERE uvv.UserID = %s AND uvv.VideoID = %s
        """
        
        progress_result = execute_db_query(
            progress_query, 
            params=[user_id, video_id], 
            fetch_one=True, 
            error_msg=f"Error fetching user progress for video_id {video_id}"
        )
        
        progress = None
        if progress_result:
            progress = dict(zip(progress_result['columns'], progress_result['row']))
            
            if progress.get('WatchedPercentage') is not None:
                progress['WatchedPercentage'] = float(progress['WatchedPercentage'])
            if progress.get('lastPosition') is not None:
                progress['lastPosition'] = float(progress['lastPosition'])
            progress['IsCompleted'] = bool(progress.get('IsCompleted', False))
        
        # Get quizzes using YouTubeVideoID
        quizzes_query = """
            SELECT 
                q.QuizID, q.Title, q.Description, q.PassingScore,
                COUNT(qq.QuestionID) AS QuestionCount,
                MAX(CASE WHEN uqa.AttemptID IS NOT NULL THEN 1 ELSE 0 END) AS HasAttempted,
                MAX(uqa.Score) AS Score,
                MAX(CASE WHEN uqa.Passed = 1 THEN 1 ELSE 0 END) AS Passed
            FROM Quizzes q
            LEFT JOIN QuizQuestions qq ON q.QuizID = qq.QuizID
            LEFT JOIN UserQuizAttempts uqa ON q.QuizID = uqa.QuizID AND uqa.UserID = %s
            WHERE q.VideoID = %s AND q.IsActive = 1
            GROUP BY q.QuizID, q.Title, q.Description, q.PassingScore
            ORDER BY q.QuizID
        """
        
        # Use YouTubeVideoID for quiz lookup
        quizzes_result = execute_db_query(
            quizzes_query, 
            params=[user_id, video['YouTubeVideoID']], 
            error_msg=f"Error fetching quizzes for video YouTube ID {video['YouTubeVideoID']}"
        )
        
        quizzes = []
        if quizzes_result:
            for quiz_row in quizzes_result['rows']:
                quiz = dict(zip(quizzes_result['columns'], quiz_row))
                
                # Convert values to appropriate types
                if quiz['Score'] is not None:
                    quiz['Score'] = float(quiz['Score'])
                if quiz['PassingScore'] is not None:
                    quiz['PassingScore'] = float(quiz['PassingScore'])
                
                # Add flags for frontend use
                quiz['CompletionStatus'] = bool(quiz['HasAttempted'])
                quiz['Passed'] = bool(quiz['Passed'])
                quiz['IsVideoQuiz'] = True
                
                quizzes.append(quiz)
        
        print(f"Found {len(quizzes)} quizzes for video {video_id} (YouTube ID: {video['YouTubeVideoID']})")
        
        # Also get course quizzes if this video is part of a course
        course_quizzes = []
        if video.get('CourseID'):
            course_quizzes_query = """
                SELECT 
                    q.QuizID, q.Title, q.Description, q.PassingScore,
                    COUNT(qq.QuestionID) AS QuestionCount,
                    MAX(CASE WHEN uqa.AttemptID IS NOT NULL THEN 1 ELSE 0 END) AS HasAttempted,
                    MAX(uqa.Score) AS Score,
                    MAX(CASE WHEN uqa.Passed = 1 THEN 1 ELSE 0 END) AS Passed
                FROM Quizzes q
                LEFT JOIN QuizQuestions qq ON q.QuizID = qq.QuizID
                LEFT JOIN UserQuizAttempts uqa ON q.QuizID = uqa.QuizID AND uqa.UserID = %s
                WHERE q.CourseID = %s AND q.VideoID IS NULL AND q.IsActive = 1
                GROUP BY q.QuizID, q.Title, q.Description, q.PassingScore
                ORDER BY q.QuizID
            """
            
            course_quizzes_result = execute_db_query(
                course_quizzes_query, 
                params=[user_id, video['CourseID']], 
                error_msg=f"Error fetching course quizzes for course_id {video['CourseID']}"
            )
            
            if course_quizzes_result:
                for cq_row in course_quizzes_result['rows']:
                    cq = dict(zip(course_quizzes_result['columns'], cq_row))
                    
                    # Convert values to appropriate types
                    if cq['Score'] is not None:
                        cq['Score'] = float(cq['Score'])
                    if cq['PassingScore'] is not None:
                        cq['PassingScore'] = float(cq['PassingScore'])
                    
                    # Add flags for frontend use
                    cq['CompletionStatus'] = bool(cq['HasAttempted'])
                    cq['Passed'] = bool(cq['Passed'])
                    cq['IsCourseQuiz'] = True
                    
                    course_quizzes.append(cq)
        
        # Check enrollment status
        enrollment = None
        if video.get('CourseID'):
            enrollment_query = """
                SELECT EnrollmentID, EnrollmentDate
                FROM UserCourseEnrollments
                WHERE UserID = %s AND CourseID = %s
            """
            
            enrollment_result = execute_db_query(
                enrollment_query, 
                params=[user_id, video['CourseID']], 
                fetch_one=True, 
                error_msg=f"Error fetching enrollment status for course_id {video['CourseID']}"
            )
            
            if enrollment_result:
                enrollment = dict(zip(enrollment_result['columns'], enrollment_result['row']))
                enrollment['isEnrolled'] = True
        
        # Get course progress
        course_progress = None
        if video.get('CourseID'):
            progress_query = """
                SELECT ProgressID, LastVideoID, CompletionPercentage, LastAccessDate, 
                       IsCompleted, CompletionDate
                FROM UserCourseProgress
                WHERE UserID = %s AND CourseID = %s
            """
            
            progress_result = execute_db_query(
                progress_query, 
                params=[user_id, video['CourseID']], 
                fetch_one=True, 
                error_msg=f"Error fetching progress status for course_id {video['CourseID']}"
            )
            
            if progress_result:
                course_progress = dict(zip(progress_result['columns'], progress_result['row']))
                
                if course_progress['CompletionPercentage'] is not None:
                    course_progress['CompletionPercentage'] = float(course_progress['CompletionPercentage'])
        
        return Response({
            'video': video,
            'quizzes': quizzes,
            'userView': progress,
            'courseQuizzes': course_quizzes,
            'enrollment': enrollment,
            'courseProgress': course_progress
        })
        
    except Exception as e:
        logger.error(f"Error in video_quizzes: {str(e)}")
        return Response(
            {'error': 'An error occurred while retrieving video quizzes', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_quizzes(request, course_id):
    """API endpoint to retrieve quizzes associated with a course"""
    try:
        user_id = request.user.id
        
        # First, verify the course exists
        course_query = """
            SELECT c.CourseID, c.Title, c.Description 
            FROM Courses c
            WHERE c.CourseID = %s
        """
        
        course_result = execute_db_query(
            course_query, 
            params=[course_id], 
            fetch_one=True, 
            error_msg=f"Error fetching course data for course_id {course_id}"
        )
        
        if not course_result:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        
        course = dict(zip(course_result['columns'], course_result['row']))
        
        # SQL Server uyumlu sorgu - NULLS LAST yerine CASE kullanıyoruz
        quizzes_query = """
            SELECT 
                q.QuizID, q.Title, q.Description, q.PassingScore,
                q.VideoID, cv.Title as VideoTitle, cv.VideoID as CourseVideoID,
                cv.OrderInCourse,
                COUNT(qq.QuestionID) AS QuestionCount,
                MAX(CASE WHEN uqa.AttemptID IS NOT NULL THEN 1 ELSE 0 END) AS HasAttempted,
                MAX(uqa.Score) AS Score,
                MAX(CASE WHEN uqa.Passed = 1 THEN 1 ELSE 0 END) AS Passed,
                q.CourseID
            FROM Quizzes q
            LEFT JOIN QuizQuestions qq ON q.QuizID = qq.QuizID
            LEFT JOIN CourseVideos cv ON q.VideoID = cv.YouTubeVideoID AND cv.CourseID = %s
            LEFT JOIN UserQuizAttempts uqa ON q.QuizID = uqa.QuizID AND uqa.UserID = %s
            WHERE (
                q.CourseID = %s OR 
                (q.VideoID IS NOT NULL AND cv.CourseID = %s)
            ) AND q.IsActive = 1
            GROUP BY q.QuizID, q.Title, q.Description, q.PassingScore, q.VideoID, cv.Title, cv.VideoID, cv.OrderInCourse, q.CourseID
            ORDER BY 
                CASE WHEN q.CourseID = %s THEN 0 ELSE 1 END,  -- Course-level quizzes first
                CASE WHEN cv.OrderInCourse IS NULL THEN 999999 ELSE cv.OrderInCourse END,  -- NULLS LAST equivalent
                q.QuizID
        """
        
        quizzes_result = execute_db_query(
            quizzes_query, 
            params=[course_id, user_id, course_id, course_id, course_id], 
            error_msg=f"Error fetching quizzes for course_id {course_id}"
        )
        
        quizzes = []
        if quizzes_result:
            for quiz_row in quizzes_result['rows']:
                quiz = dict(zip(quizzes_result['columns'], quiz_row))
                
                # Convert values to appropriate types
                if quiz['Score'] is not None:
                    quiz['Score'] = float(quiz['Score'])
                if quiz['PassingScore'] is not None:
                    quiz['PassingScore'] = float(quiz['PassingScore'])
                
                # Add flags for frontend use
                quiz['CompletionStatus'] = bool(quiz['HasAttempted'])
                quiz['Passed'] = bool(quiz['Passed'])
                quiz['HasVideo'] = quiz['VideoID'] is not None
                quiz['IsCourseQuiz'] = quiz['VideoID'] is None  # Course-level quiz
                quiz['IsVideoQuiz'] = quiz['VideoID'] is not None  # Video-specific quiz
                
                quizzes.append(quiz)
        
        print(f"Found {len(quizzes)} total quizzes for course {course_id}")
        
        # Get course videos to check view status
        videos_query = """
            SELECT cv.VideoID, cv.Title, cv.Duration, cv.YouTubeVideoID, cv.OrderInCourse
            FROM CourseVideos cv
            WHERE cv.CourseID = %s
            ORDER BY cv.OrderInCourse
        """
        
        videos_result = execute_db_query(
            videos_query, 
            params=[course_id], 
            error_msg=f"Error fetching videos for course_id {course_id}"
        )
        
        videos = []
        if videos_result:
            for video_row in videos_result['rows']:
                video = dict(zip(videos_result['columns'], video_row))
                videos.append(video)
        
        # Get user's video progress for this course
        progress_query = """
            SELECT uvv.VideoID, uvv.WatchedPercentage, uvv.IsCompleted, uvv.lastPosition
            FROM UserVideoViews uvv
            INNER JOIN CourseVideos cv ON uvv.VideoID = cv.VideoID
            WHERE uvv.UserID = %s AND cv.CourseID = %s
        """
        
        progress_result = execute_db_query(
            progress_query, 
            params=[user_id, course_id], 
            error_msg=f"Error fetching user video progress for course_id {course_id}"
        )
        
        video_progress = []
        if progress_result:
            for progress_row in progress_result['rows']:
                progress = dict(zip(progress_result['columns'], progress_row))
                
                # Convert decimal values
                if progress['WatchedPercentage'] is not None:
                    progress['WatchedPercentage'] = float(progress['WatchedPercentage'])
                
                video_progress.append(progress)
        
        # Create ordered content that mixes videos and quizzes
        ordered_content = []
        
        # Add videos first, then their associated quizzes
        for video in videos:
            # Add the video
            video['type'] = 'video'
            ordered_content.append(video)
            
            # Add quizzes associated with this video
            video_quizzes = [q for q in quizzes if q['VideoID'] == video['YouTubeVideoID']]
            for quiz in video_quizzes:
                quiz['type'] = 'quiz'
                ordered_content.append(quiz)
        
        # Add course-level quizzes at the end
        course_level_quizzes = [q for q in quizzes if q['VideoID'] is None]
        for quiz in course_level_quizzes:
            quiz['type'] = 'quiz'
            ordered_content.append(quiz)
        
        # Get enrollment/progress status
        enrollment_query = """
            SELECT EnrollmentID, EnrollmentDate
            FROM UserCourseEnrollments
            WHERE UserID = %s AND CourseID = %s
        """
        
        enrollment_result = execute_db_query(
            enrollment_query, 
            params=[user_id, course_id], 
            fetch_one=True, 
            error_msg=f"Error fetching enrollment status for course_id {course_id}"
        )
        
        enrollment = None
        if enrollment_result:
            enrollment = dict(zip(enrollment_result['columns'], enrollment_result['row']))
            enrollment['isEnrolled'] = True
        
        progress_query = """
            SELECT ProgressID, LastVideoID, CompletionPercentage, LastAccessDate, 
                   IsCompleted, CompletionDate
            FROM UserCourseProgress
            WHERE UserID = %s AND CourseID = %s
        """
        
        progress_result = execute_db_query(
            progress_query, 
            params=[user_id, course_id], 
            fetch_one=True, 
            error_msg=f"Error fetching progress status for course_id {course_id}"
        )
        
        progress = None
        if progress_result:
            progress = dict(zip(progress_result['columns'], progress_result['row']))
            
            if progress['CompletionPercentage'] is not None:
                progress['CompletionPercentage'] = float(progress['CompletionPercentage'])
        
        return Response({
            'course': course,
            'quizzes': quizzes,
            'videos': videos,
            'orderedContent': ordered_content,
            'videoProgress': video_progress,
            'enrollment': enrollment,
            'progress': progress
        })
        
    except Exception as e:
        logger.error(f"Error in course_quizzes: {str(e)}")
        return Response(
            {'error': 'An error occurred while retrieving course quizzes', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )