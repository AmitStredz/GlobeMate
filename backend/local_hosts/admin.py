from django.contrib import admin
from django.utils.html import format_html
from .models import LocalHost, LocalHostDocument, LocalHostReview, LocalHostBooking


@admin.register(LocalHost)
class LocalHostAdmin(admin.ModelAdmin):
    list_display = [
        'full_name', 'user', 'status', 'services_display', 
        'phone_number', 'application_date', 'review_date'
    ]
    list_filter = ['status', 'services_offered', 'application_date', 'created_at']
    search_fields = ['full_name', 'user__username', 'user__email', 'phone_number']
    readonly_fields = ['user', 'application_date', 'created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'full_name', 'age', 'phone_number', 'address')
        }),
        ('Identity Documents', {
            'fields': ('aadhaar_number', 'pan_number', 'documents_provided')
        }),
        ('Service Information', {
            'fields': (
                'services_offered', 'custom_service', 'service_description',
                'experience_years', 'price_range', 'availability'
            )
        }),
        ('Application Status', {
            'fields': (
                'status', 'application_date', 'review_date', 'reviewer_notes'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['approve_applications', 'reject_applications', 'mark_under_review']
    
    def services_display(self, obj):
        """Display services in a readable format"""
        return ', '.join(obj.service_names[:3]) + ('...' if len(obj.service_names) > 3 else '')
    services_display.short_description = 'Services'
    
    def approve_applications(self, request, queryset):
        """Approve selected applications"""
        count = queryset.update(status='APPROVED')
        self.message_user(request, f'{count} applications approved.')
    approve_applications.short_description = 'Approve selected applications'
    
    def reject_applications(self, request, queryset):
        """Reject selected applications"""
        count = queryset.update(status='REJECTED')
        self.message_user(request, f'{count} applications rejected.')
    reject_applications.short_description = 'Reject selected applications'
    
    def mark_under_review(self, request, queryset):
        """Mark applications as under review"""
        count = queryset.update(status='UNDER_REVIEW')
        self.message_user(request, f'{count} applications marked as under review.')
    mark_under_review.short_description = 'Mark as under review'


@admin.register(LocalHostDocument)
class LocalHostDocumentAdmin(admin.ModelAdmin):
    list_display = [
        'local_host', 'document_type', 'uploaded_at', 
        'is_verified', 'verification_status'
    ]
    list_filter = ['document_type', 'is_verified', 'uploaded_at']
    search_fields = ['local_host__full_name', 'local_host__user__username']
    readonly_fields = ['uploaded_at']
    
    def verification_status(self, obj):
        """Display verification status with color"""
        if obj.is_verified:
            return format_html('<span style="color: green;">✓ Verified</span>')
        else:
            return format_html('<span style="color: orange;">⏳ Pending</span>')
    verification_status.short_description = 'Status'


@admin.register(LocalHostReview)
class LocalHostReviewAdmin(admin.ModelAdmin):
    list_display = [
        'local_host', 'reviewer', 'rating', 'service_type', 
        'created_at', 'review_preview'
    ]
    list_filter = ['rating', 'service_type', 'created_at']
    search_fields = [
        'local_host__full_name', 'reviewer__username', 'review_text'
    ]
    readonly_fields = ['created_at', 'updated_at']
    
    def review_preview(self, obj):
        """Show preview of review text"""
        if obj.review_text:
            return obj.review_text[:50] + ('...' if len(obj.review_text) > 50 else '')
        return '-'
    review_preview.short_description = 'Review Preview'


@admin.register(LocalHostBooking)
class LocalHostBookingAdmin(admin.ModelAdmin):
    list_display = [
        'traveler', 'local_host', 'service_type', 'start_date', 
        'end_date', 'status', 'final_price', 'created_at'
    ]
    list_filter = ['status', 'service_type', 'start_date', 'created_at']
    search_fields = [
        'traveler__username', 'local_host__full_name', 
        'special_requests', 'traveler_notes'
    ]
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Booking Information', {
            'fields': (
                'traveler', 'local_host', 'service_type', 
                'start_date', 'end_date', 'number_of_people'
            )
        }),
        ('Details & Pricing', {
            'fields': (
                'special_requests', 'quoted_price', 'final_price', 'status'
            )
        }),
        ('Communication', {
            'fields': ('host_response', 'traveler_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
