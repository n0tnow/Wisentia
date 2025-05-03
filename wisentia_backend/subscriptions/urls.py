from django.urls import path
from . import views

urlpatterns = [
    path('plans/', views.list_plans, name='list-plans'),
    path('user/', views.user_subscription, name='user-subscription'),
    path('subscribe/', views.subscribe, name='subscribe'),
    path('<int:subscription_id>/cancel/', views.cancel_subscription, name='cancel-subscription'),
    path('<int:subscription_id>/auto-renew/', views.toggle_auto_renew, name='toggle-auto-renew'),
    path('<int:subscription_id>/renew/', views.renew_subscription, name='renew-subscription'),
    path('trade-nfts/', views.trade_nfts_for_subscription, name='trade-nfts-for-subscription'),
    path('check-access/', views.check_subscription_access, name='check-subscription-access'),
    path('plans/create/', views.create_subscription_plan, name='create-subscription-plan'),
    path('plans/<int:plan_id>/update/', views.update_subscription_plan, name='update-subscription-plan'),
    
    path('admin/', views.admin_subscriptions, name='admin-subscriptions'), # Ana admin panel verisi
    path('admin/plans/create/', views.create_subscription_plan, name='create-subscription-plan'),
    path('admin/plans/<int:plan_id>/update/', views.update_subscription_plan, name='update-subscription-plan'),
    #path('admin/stats/', views.subscription_stats, name='subscription-stats'),
]