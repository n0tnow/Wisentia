-- Script to create missing tables in the Wisentia database
-- Run this script to fix the current database errors

USE WisentiaDB;
GO

-- Check if UserCourseRatings table exists and create it if it doesn't
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'UserCourseRatings')
BEGIN
    PRINT 'Creating UserCourseRatings table...';
    
    CREATE TABLE UserCourseRatings (
        RatingID INT PRIMARY KEY IDENTITY(1,1),
        UserID INT NOT NULL,
        CourseID INT NOT NULL,
        Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
        Comment NVARCHAR(MAX),
        CreationDate DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_UserCourseRatings_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
        CONSTRAINT FK_UserCourseRatings_Courses FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
        CONSTRAINT UQ_UserCourseRatings_User_Course UNIQUE(UserID, CourseID)
    );
    
    PRINT 'UserCourseRatings table created successfully.';
END
ELSE
BEGIN
    PRINT 'UserCourseRatings table already exists.';
END

-- Check if UserCourseEnrollments table exists and create it if it doesn't
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'UserCourseEnrollments')
BEGIN
    PRINT 'Creating UserCourseEnrollments table...';
    
    CREATE TABLE UserCourseEnrollments (
        EnrollmentID INT PRIMARY KEY IDENTITY(1,1),
        UserID INT NOT NULL,
        CourseID INT NOT NULL,
        EnrollmentDate DATETIME NOT NULL DEFAULT GETDATE(),
        IsActive BIT DEFAULT 1,
        CONSTRAINT FK_UserCourseEnrollments_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
        CONSTRAINT FK_UserCourseEnrollments_Courses FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
        CONSTRAINT UQ_UserCourseEnrollments_User_Course UNIQUE(UserID, CourseID)
    );
    
    PRINT 'UserCourseEnrollments table created successfully.';
    
    -- If UserCourseProgress table exists, copy enrollments data from it
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'UserCourseProgress')
    BEGIN
        PRINT 'Copying enrollment data from UserCourseProgress...';
        
        INSERT INTO UserCourseEnrollments (UserID, CourseID, EnrollmentDate)
        SELECT DISTINCT UserID, CourseID, LastAccessDate
        FROM UserCourseProgress
        WHERE NOT EXISTS (
            SELECT 1 FROM UserCourseEnrollments
            WHERE UserCourseEnrollments.UserID = UserCourseProgress.UserID
            AND UserCourseEnrollments.CourseID = UserCourseProgress.CourseID
        );
        
        PRINT 'Enrollment data copied successfully.';
    END
END
ELSE
BEGIN
    PRINT 'UserCourseEnrollments table already exists.';
END

PRINT 'Database update completed successfully.';
GO 