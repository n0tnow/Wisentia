# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Aigeneratedcontent(models.Model):
    contentid = models.AutoField(db_column='ContentID', primary_key=True)  # Field name made lowercase.
    contenttype = models.CharField(db_column='ContentType', max_length=50, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    content = models.TextField(db_column='Content', db_collation='Turkish_CI_AS')  # Field name made lowercase.
    generationparams = models.TextField(db_column='GenerationParams', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    creationdate = models.DateTimeField(db_column='CreationDate')  # Field name made lowercase.
    approvalstatus = models.CharField(db_column='ApprovalStatus', max_length=20, db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    approvaldate = models.DateTimeField(db_column='ApprovalDate', blank=True, null=True)  # Field name made lowercase.
    approvedby = models.ForeignKey('Users', models.DO_NOTHING, db_column='ApprovedBy', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'AIGeneratedContent'


class Airecommendations(models.Model):
    recommendationid = models.AutoField(db_column='RecommendationID', primary_key=True)  # Field name made lowercase.
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='UserID', blank=True, null=True)  # Field name made lowercase.
    recommendationtype = models.CharField(db_column='RecommendationType', max_length=50, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    targetid = models.IntegerField(db_column='TargetID', blank=True, null=True)  # Field name made lowercase.
    recommendationreason = models.TextField(db_column='RecommendationReason', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    confidence = models.DecimalField(db_column='Confidence', max_digits=5, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    creationdate = models.DateTimeField(db_column='CreationDate')  # Field name made lowercase.
    isviewed = models.BooleanField(db_column='IsViewed', blank=True, null=True)  # Field name made lowercase.
    isdismissed = models.BooleanField(db_column='IsDismissed', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'AIRecommendations'


class Aiuseranalytics(models.Model):
    analysisid = models.AutoField(db_column='AnalysisID', primary_key=True)  # Field name made lowercase.
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='UserID', blank=True, null=True)  # Field name made lowercase.
    learningstyle = models.CharField(db_column='LearningStyle', max_length=50, db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    interestcategories = models.TextField(db_column='InterestCategories', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    strengthareas = models.TextField(db_column='StrengthAreas', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    weaknessareas = models.TextField(db_column='WeaknessAreas', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    engagementlevel = models.DecimalField(db_column='EngagementLevel', max_digits=5, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    lastupdated = models.DateTimeField(db_column='LastUpdated')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'AIUserAnalytics'


class Activitylogs(models.Model):
    logid = models.AutoField(db_column='LogID', primary_key=True)  # Field name made lowercase.
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='UserID', blank=True, null=True)  # Field name made lowercase.
    activitytype = models.CharField(db_column='ActivityType', max_length=50, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    description = models.TextField(db_column='Description', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    timestamp = models.DateTimeField(db_column='Timestamp')  # Field name made lowercase.
    ipaddress = models.CharField(db_column='IPAddress', max_length=50, db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    useragent = models.CharField(db_column='UserAgent', max_length=255, db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ActivityLogs'


class Chatmessages(models.Model):
    messageid = models.AutoField(db_column='MessageID', primary_key=True)  # Field name made lowercase.
    sessionid = models.ForeignKey('Chatsessions', models.DO_NOTHING, db_column='SessionID', blank=True, null=True)  # Field name made lowercase.
    sendertype = models.CharField(db_column='SenderType', max_length=10, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    messagecontent = models.TextField(db_column='MessageContent', db_collation='Turkish_CI_AS')  # Field name made lowercase.
    timestamp = models.DateTimeField(db_column='Timestamp')  # Field name made lowercase.
    relatedcourseid = models.ForeignKey('Courses', models.DO_NOTHING, db_column='RelatedCourseID', blank=True, null=True)  # Field name made lowercase.
    relatedquestid = models.ForeignKey('Quests', models.DO_NOTHING, db_column='RelatedQuestID', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ChatMessages'


class Chatsessions(models.Model):
    sessionid = models.AutoField(db_column='SessionID', primary_key=True)  # Field name made lowercase.
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='UserID', blank=True, null=True)  # Field name made lowercase.
    starttime = models.DateTimeField(db_column='StartTime')  # Field name made lowercase.
    endtime = models.DateTimeField(db_column='EndTime', blank=True, null=True)  # Field name made lowercase.
    isactive = models.BooleanField(db_column='IsActive', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ChatSessions'


class Communitycomments(models.Model):
    commentid = models.AutoField(db_column='CommentID', primary_key=True)  # Field name made lowercase.
    postid = models.ForeignKey('Communityposts', models.DO_NOTHING, db_column='PostID', blank=True, null=True)  # Field name made lowercase.
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='UserID', blank=True, null=True)  # Field name made lowercase.
    content = models.TextField(db_column='Content', db_collation='Turkish_CI_AS')  # Field name made lowercase.
    creationdate = models.DateTimeField(db_column='CreationDate')  # Field name made lowercase.
    parentcommentid = models.ForeignKey('self', models.DO_NOTHING, db_column='ParentCommentID', blank=True, null=True)  # Field name made lowercase.
    likes = models.IntegerField(db_column='Likes', blank=True, null=True)  # Field name made lowercase.
    isactive = models.BooleanField(db_column='IsActive', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CommunityComments'


class Communityposts(models.Model):
    postid = models.AutoField(db_column='PostID', primary_key=True)  # Field name made lowercase.
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='UserID', blank=True, null=True)  # Field name made lowercase.
    title = models.CharField(db_column='Title', max_length=100, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    content = models.TextField(db_column='Content', db_collation='Turkish_CI_AS')  # Field name made lowercase.
    creationdate = models.DateTimeField(db_column='CreationDate')  # Field name made lowercase.
    category = models.CharField(db_column='Category', max_length=50, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    pointscost = models.IntegerField(db_column='PointsCost', blank=True, null=True)  # Field name made lowercase.
    likes = models.IntegerField(db_column='Likes', blank=True, null=True)  # Field name made lowercase.
    views = models.IntegerField(db_column='Views', blank=True, null=True)  # Field name made lowercase.
    isactive = models.BooleanField(db_column='IsActive', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CommunityPosts'


class Coursevideos(models.Model):
    videoid = models.AutoField(db_column='VideoID', primary_key=True)  # Field name made lowercase.
    courseid = models.ForeignKey('Courses', models.DO_NOTHING, db_column='CourseID', blank=True, null=True)  # Field name made lowercase.
    youtubevideoid = models.CharField(db_column='YouTubeVideoID', max_length=20, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    title = models.CharField(db_column='Title', max_length=100, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    description = models.TextField(db_column='Description', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    duration = models.IntegerField(db_column='Duration', blank=True, null=True)  # Field name made lowercase.
    orderincourse = models.IntegerField(db_column='OrderInCourse')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CourseVideos'
        unique_together = (('courseid', 'orderincourse'),)


class Courses(models.Model):
    courseid = models.AutoField(db_column='CourseID', primary_key=True)  # Field name made lowercase.
    title = models.CharField(db_column='Title', max_length=100, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    description = models.TextField(db_column='Description', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    category = models.CharField(db_column='Category', max_length=50, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    difficulty = models.CharField(db_column='Difficulty', max_length=20, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    creationdate = models.DateTimeField(db_column='CreationDate')  # Field name made lowercase.
    updateddate = models.DateTimeField(db_column='UpdatedDate', blank=True, null=True)  # Field name made lowercase.
    isactive = models.BooleanField(db_column='IsActive', blank=True, null=True)  # Field name made lowercase.
    thumbnailurl = models.CharField(db_column='ThumbnailURL', max_length=255, db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    createdby = models.ForeignKey('Users', models.DO_NOTHING, db_column='CreatedBy', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Courses'


class Nfttradedetails(models.Model):
    tradedetailid = models.AutoField(db_column='TradeDetailID', primary_key=True)  # Field name made lowercase.
    tradeid = models.ForeignKey('Nfttrades', models.DO_NOTHING, db_column='TradeID', blank=True, null=True)  # Field name made lowercase.
    offeredusernftid = models.ForeignKey('Usernfts', models.DO_NOTHING, db_column='OfferedUserNFTID', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'NFTTradeDetails'


class Nfttrades(models.Model):
    tradeid = models.AutoField(db_column='TradeID', primary_key=True)  # Field name made lowercase.
    offeruserid = models.ForeignKey('Users', models.DO_NOTHING, db_column='OfferUserID', blank=True, null=True)  # Field name made lowercase.
    targetnftid = models.ForeignKey('Nfts', models.DO_NOTHING, db_column='TargetNFTID', blank=True, null=True)  # Field name made lowercase.
    tradestatus = models.CharField(db_column='TradeStatus', max_length=20, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    creationdate = models.DateTimeField(db_column='CreationDate')  # Field name made lowercase.
    completiondate = models.DateTimeField(db_column='CompletionDate', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'NFTTrades'


class Nfttypes(models.Model):
    nfttypeid = models.AutoField(db_column='NFTTypeID', primary_key=True)  # Field name made lowercase.
    typename = models.CharField(db_column='TypeName', unique=True, max_length=50, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    description = models.CharField(db_column='Description', max_length=255, db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'NFTTypes'


class Nfts(models.Model):
    nftid = models.AutoField(db_column='NFTID', primary_key=True)  # Field name made lowercase.
    nfttypeid = models.ForeignKey(Nfttypes, models.DO_NOTHING, db_column='NFTTypeID', blank=True, null=True)  # Field name made lowercase.
    title = models.CharField(db_column='Title', max_length=100, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    description = models.TextField(db_column='Description', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    imageuri = models.CharField(db_column='ImageURI', max_length=255, db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    blockchainmetadata = models.TextField(db_column='BlockchainMetadata', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    tradevalue = models.IntegerField(db_column='TradeValue')  # Field name made lowercase.
    subscriptiondays = models.IntegerField(db_column='SubscriptionDays', blank=True, null=True)  # Field name made lowercase.
    isactive = models.BooleanField(db_column='IsActive', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'NFTs'


class Notifications(models.Model):
    notificationid = models.AutoField(db_column='NotificationID', primary_key=True)  # Field name made lowercase.
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='UserID', blank=True, null=True)  # Field name made lowercase.
    title = models.CharField(db_column='Title', max_length=100, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    message = models.TextField(db_column='Message', db_collation='Turkish_CI_AS')  # Field name made lowercase.
    notificationtype = models.CharField(db_column='NotificationType', max_length=50, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    relatedentityid = models.IntegerField(db_column='RelatedEntityID', blank=True, null=True)  # Field name made lowercase.
    isread = models.BooleanField(db_column='IsRead', blank=True, null=True)  # Field name made lowercase.
    isdismissed = models.BooleanField(db_column='IsDismissed', blank=True, null=True)  # Field name made lowercase.
    creationdate = models.DateTimeField(db_column='CreationDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Notifications'


class Questconditions(models.Model):
    conditionid = models.AutoField(db_column='ConditionID', primary_key=True)  # Field name made lowercase.
    questid = models.ForeignKey('Quests', models.DO_NOTHING, db_column='QuestID', blank=True, null=True)  # Field name made lowercase.
    conditiontype = models.CharField(db_column='ConditionType', max_length=50, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    targetid = models.IntegerField(db_column='TargetID', blank=True, null=True)  # Field name made lowercase.
    targetvalue = models.IntegerField(db_column='TargetValue', blank=True, null=True)  # Field name made lowercase.
    description = models.TextField(db_column='Description', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'QuestConditions'


class Questionoptions(models.Model):
    optionid = models.AutoField(db_column='OptionID', primary_key=True)  # Field name made lowercase.
    questionid = models.ForeignKey('Quizquestions', models.DO_NOTHING, db_column='QuestionID', blank=True, null=True)  # Field name made lowercase.
    optiontext = models.CharField(db_column='OptionText', max_length=255, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    iscorrect = models.BooleanField(db_column='IsCorrect')  # Field name made lowercase.
    orderinquestion = models.IntegerField(db_column='OrderInQuestion')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'QuestionOptions'


class Quests(models.Model):
    questid = models.AutoField(db_column='QuestID', primary_key=True)  # Field name made lowercase.
    title = models.CharField(db_column='Title', max_length=100, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    description = models.TextField(db_column='Description', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    requiredpoints = models.IntegerField(db_column='RequiredPoints')  # Field name made lowercase.
    rewardnftid = models.ForeignKey(Nfts, models.DO_NOTHING, db_column='RewardNFTID', blank=True, null=True)  # Field name made lowercase.
    rewardpoints = models.IntegerField(db_column='RewardPoints')  # Field name made lowercase.
    difficultylevel = models.CharField(db_column='DifficultyLevel', max_length=20, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    isactive = models.BooleanField(db_column='IsActive', blank=True, null=True)  # Field name made lowercase.
    isaigenerated = models.BooleanField(db_column='IsAIGenerated', blank=True, null=True)  # Field name made lowercase.
    creationdate = models.DateTimeField(db_column='CreationDate')  # Field name made lowercase.
    startdate = models.DateTimeField(db_column='StartDate', blank=True, null=True)  # Field name made lowercase.
    enddate = models.DateTimeField(db_column='EndDate', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Quests'


class Quizquestions(models.Model):
    questionid = models.AutoField(db_column='QuestionID', primary_key=True)  # Field name made lowercase.
    quizid = models.ForeignKey('Quizzes', models.DO_NOTHING, db_column='QuizID', blank=True, null=True)  # Field name made lowercase.
    questiontext = models.TextField(db_column='QuestionText', db_collation='Turkish_CI_AS')  # Field name made lowercase.
    questiontype = models.CharField(db_column='QuestionType', max_length=20, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    orderinquiz = models.IntegerField(db_column='OrderInQuiz')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'QuizQuestions'


class Quizzes(models.Model):
    quizid = models.AutoField(db_column='QuizID', primary_key=True)  # Field name made lowercase.
    videoid = models.ForeignKey(Coursevideos, models.DO_NOTHING, db_column='VideoID', blank=True, null=True)  # Field name made lowercase.
    title = models.CharField(db_column='Title', max_length=100, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    description = models.TextField(db_column='Description', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    passingscore = models.IntegerField(db_column='PassingScore')  # Field name made lowercase.
    isactive = models.BooleanField(db_column='IsActive', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Quizzes'


class Subscriptionplans(models.Model):
    planid = models.AutoField(db_column='PlanID', primary_key=True)  # Field name made lowercase.
    planname = models.CharField(db_column='PlanName', max_length=50, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    description = models.TextField(db_column='Description', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    durationdays = models.IntegerField(db_column='DurationDays')  # Field name made lowercase.
    price = models.DecimalField(db_column='Price', max_digits=10, decimal_places=2)  # Field name made lowercase.
    nftid = models.ForeignKey(Nfts, models.DO_NOTHING, db_column='NFTID', blank=True, null=True)  # Field name made lowercase.
    features = models.TextField(db_column='Features', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    isactive = models.BooleanField(db_column='IsActive', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SubscriptionPlans'


class Systemsettings(models.Model):
    settingid = models.AutoField(db_column='SettingID', primary_key=True)  # Field name made lowercase.
    settingkey = models.CharField(db_column='SettingKey', unique=True, max_length=50, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    settingvalue = models.TextField(db_column='SettingValue', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    description = models.CharField(db_column='Description', max_length=255, db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    lastupdated = models.DateTimeField(db_column='LastUpdated')  # Field name made lowercase.
    updatedby = models.ForeignKey('Users', models.DO_NOTHING, db_column='UpdatedBy', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SystemSettings'


class Usercourseprogress(models.Model):
    progressid = models.AutoField(db_column='ProgressID', primary_key=True)  # Field name made lowercase.
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='UserID', blank=True, null=True)  # Field name made lowercase.
    courseid = models.ForeignKey(Courses, models.DO_NOTHING, db_column='CourseID', blank=True, null=True)  # Field name made lowercase.
    lastvideoid = models.ForeignKey(Coursevideos, models.DO_NOTHING, db_column='LastVideoID', blank=True, null=True)  # Field name made lowercase.
    completionpercentage = models.DecimalField(db_column='CompletionPercentage', max_digits=5, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    lastaccessdate = models.DateTimeField(db_column='LastAccessDate', blank=True, null=True)  # Field name made lowercase.
    iscompleted = models.BooleanField(db_column='IsCompleted', blank=True, null=True)  # Field name made lowercase.
    completiondate = models.DateTimeField(db_column='CompletionDate', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'UserCourseProgress'
        unique_together = (('userid', 'courseid'),)


class Userlikes(models.Model):
    likeid = models.AutoField(db_column='LikeID', primary_key=True)  # Field name made lowercase.
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='UserID', blank=True, null=True)  # Field name made lowercase.
    postid = models.ForeignKey(Communityposts, models.DO_NOTHING, db_column='PostID', blank=True, null=True)  # Field name made lowercase.
    commentid = models.ForeignKey(Communitycomments, models.DO_NOTHING, db_column='CommentID', blank=True, null=True)  # Field name made lowercase.
    likedate = models.DateTimeField(db_column='LikeDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'UserLikes'
        unique_together = (('userid', 'commentid'), ('userid', 'postid'),)


class Usernfts(models.Model):
    usernftid = models.AutoField(db_column='UserNFTID', primary_key=True)  # Field name made lowercase.
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='UserID', blank=True, null=True)  # Field name made lowercase.
    nftid = models.ForeignKey(Nfts, models.DO_NOTHING, db_column='NFTID', blank=True, null=True)  # Field name made lowercase.
    acquisitiondate = models.DateTimeField(db_column='AcquisitionDate')  # Field name made lowercase.
    expirydate = models.DateTimeField(db_column='ExpiryDate', blank=True, null=True)  # Field name made lowercase.
    transactionhash = models.CharField(db_column='TransactionHash', max_length=100, db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    isminted = models.BooleanField(db_column='IsMinted', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'UserNFTs'
        unique_together = (('userid', 'nftid'),)


class Userquestprogress(models.Model):
    progressid = models.AutoField(db_column='ProgressID', primary_key=True)  # Field name made lowercase.
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='UserID', blank=True, null=True)  # Field name made lowercase.
    questid = models.ForeignKey(Quests, models.DO_NOTHING, db_column='QuestID', blank=True, null=True)  # Field name made lowercase.
    currentprogress = models.IntegerField(db_column='CurrentProgress', blank=True, null=True)  # Field name made lowercase.
    iscompleted = models.BooleanField(db_column='IsCompleted', blank=True, null=True)  # Field name made lowercase.
    completiondate = models.DateTimeField(db_column='CompletionDate', blank=True, null=True)  # Field name made lowercase.
    rewardclaimed = models.BooleanField(db_column='RewardClaimed', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'UserQuestProgress'
        unique_together = (('userid', 'questid'),)


class Userquizanswers(models.Model):
    answerid = models.AutoField(db_column='AnswerID', primary_key=True)  # Field name made lowercase.
    attemptid = models.ForeignKey('Userquizattempts', models.DO_NOTHING, db_column='AttemptID', blank=True, null=True)  # Field name made lowercase.
    questionid = models.ForeignKey(Quizquestions, models.DO_NOTHING, db_column='QuestionID', blank=True, null=True)  # Field name made lowercase.
    selectedoptionid = models.ForeignKey(Questionoptions, models.DO_NOTHING, db_column='SelectedOptionID', blank=True, null=True)  # Field name made lowercase.
    textanswer = models.TextField(db_column='TextAnswer', db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    iscorrect = models.BooleanField(db_column='IsCorrect')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'UserQuizAnswers'


class Userquizattempts(models.Model):
    attemptid = models.AutoField(db_column='AttemptID', primary_key=True)  # Field name made lowercase.
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='UserID', blank=True, null=True)  # Field name made lowercase.
    quizid = models.ForeignKey(Quizzes, models.DO_NOTHING, db_column='QuizID', blank=True, null=True)  # Field name made lowercase.
    score = models.IntegerField(db_column='Score')  # Field name made lowercase.
    maxscore = models.IntegerField(db_column='MaxScore')  # Field name made lowercase.
    attemptdate = models.DateTimeField(db_column='AttemptDate')  # Field name made lowercase.
    passed = models.BooleanField(db_column='Passed')  # Field name made lowercase.
    earnedpoints = models.IntegerField(db_column='EarnedPoints', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'UserQuizAttempts'


class Usersubscriptions(models.Model):
    subscriptionid = models.AutoField(db_column='SubscriptionID', primary_key=True)  # Field name made lowercase.
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='UserID', blank=True, null=True)  # Field name made lowercase.
    planid = models.ForeignKey(Subscriptionplans, models.DO_NOTHING, db_column='PlanID', blank=True, null=True)  # Field name made lowercase.
    startdate = models.DateTimeField(db_column='StartDate')  # Field name made lowercase.
    enddate = models.DateTimeField(db_column='EndDate')  # Field name made lowercase.
    isactive = models.BooleanField(db_column='IsActive', blank=True, null=True)  # Field name made lowercase.
    paymenttransactionid = models.CharField(db_column='PaymentTransactionID', max_length=100, db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    paymentmethod = models.CharField(db_column='PaymentMethod', max_length=50, db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    autorenew = models.BooleanField(db_column='AutoRenew', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'UserSubscriptions'


class Uservideoviews(models.Model):
    viewid = models.AutoField(db_column='ViewID', primary_key=True)  # Field name made lowercase.
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='UserID', blank=True, null=True)  # Field name made lowercase.
    videoid = models.ForeignKey(Coursevideos, models.DO_NOTHING, db_column='VideoID', blank=True, null=True)  # Field name made lowercase.
    viewdate = models.DateTimeField(db_column='ViewDate')  # Field name made lowercase.
    watchedpercentage = models.DecimalField(db_column='WatchedPercentage', max_digits=5, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    iscompleted = models.BooleanField(db_column='IsCompleted', blank=True, null=True)  # Field name made lowercase.
    completiondate = models.DateTimeField(db_column='CompletionDate', blank=True, null=True)  # Field name made lowercase.
    earnedpoints = models.IntegerField(db_column='EarnedPoints', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'UserVideoViews'
        unique_together = (('userid', 'videoid'),)


class Users(models.Model):
    userid = models.AutoField(db_column='UserID', primary_key=True)  # Field name made lowercase.
    username = models.CharField(db_column='Username', unique=True, max_length=50, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    email = models.CharField(db_column='Email', unique=True, max_length=100, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    passwordhash = models.CharField(db_column='PasswordHash', max_length=255, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    walletaddress = models.CharField(db_column='WalletAddress', unique=True, max_length=100, db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    joindate = models.DateTimeField(db_column='JoinDate')  # Field name made lowercase.
    lastlogin = models.DateTimeField(db_column='LastLogin', blank=True, null=True)  # Field name made lowercase.
    userrole = models.CharField(db_column='UserRole', max_length=20, db_collation='Turkish_CI_AS')  # Field name made lowercase.
    profileimage = models.CharField(db_column='ProfileImage', max_length=255, db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    themepreference = models.CharField(db_column='ThemePreference', max_length=20, db_collation='Turkish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    totalpoints = models.IntegerField(db_column='TotalPoints', blank=True, null=True)  # Field name made lowercase.
    isactive = models.BooleanField(db_column='IsActive', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Users'
