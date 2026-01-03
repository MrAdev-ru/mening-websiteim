// Multi-step form functionality
class AppointmentForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        this.init();
    }

    init() {
        // Initialize event listeners
        this.bindEvents();
        // Show first step
        this.showStep(1);
        // Set minimum date to today
        this.setMinDate();
        // Load doctors based on department
        this.loadDoctorOptions();
    }

    bindEvents() {
        // Next/Previous buttons
        document.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nextStep = e.target.dataset.next;
                if (this.validateStep(this.currentStep)) {
                    this.saveStepData(this.currentStep);
                    this.showStep(parseInt(nextStep.replace('step', '')));
                }
            });
        });

        document.querySelectorAll('.btn-prev').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prevStep = e.target.dataset.prev;
                this.showStep(parseInt(prevStep.replace('step', '')));
            });
        });

        // Form submission
        document.getElementById('appointmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });

        // Department change - load doctors
        document.getElementById('department').addEventListener('change', () => {
            this.loadDoctorOptions();
        });

        // Real-time form validation
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });

        // Mobile menu toggle
        document.getElementById('mobileMenuToggle').addEventListener('click', () => {
            document.querySelector('.main-nav').classList.toggle('active');
        });

        // Modal close button
        document.getElementById('modalCloseBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal when clicking outside
        document.getElementById('successModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('successModal')) {
                this.closeModal();
            }
        });
    }

    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        document.getElementById(`step${stepNumber}`).classList.add('active');
        this.currentStep = stepNumber;

        // Update review section if we're on step 3
        if (stepNumber === 3) {
            this.updateReviewSection();
        }

        // Scroll to top of form
        document.querySelector('.appointment-form').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    validateStep(step) {
        let isValid = true;
        const stepElement = document.getElementById(`step${step}`);
        
        // Get all required fields in current step
        const requiredFields = stepElement.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showToast('Please fill all required fields correctly.', 'error');
        }

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const errorElement = field.parentElement.querySelector('.field-error') || 
                            this.createErrorElement(field);
        
        // Clear previous error
        errorElement.textContent = '';
        field.classList.remove('error');

        // Check if field is required and empty
        if (field.hasAttribute('required') && !value) {
            errorElement.textContent = 'This field is required';
            field.classList.add('error');
            return false;
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorElement.textContent = 'Please enter a valid email address';
                field.classList.add('error');
                return false;
            }
        }

        // Phone validation
        if (field.id === 'phone' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleanedPhone = value.replace(/\D/g, '');
            if (!phoneRegex.test(cleanedPhone) || cleanedPhone.length < 10) {
                errorElement.textContent = 'Please enter a valid phone number';
                field.classList.add('error');
                return false;
            }
        }

        // Date validation
        if (field.id === 'appointmentDate' && value) {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                errorElement.textContent = 'Please select a future date';
                field.classList.add('error');
                return false;
            }
        }

        return true;
    }

    createErrorElement(field) {
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.color = '#f82f56';
        errorElement.style.fontSize = '0.85rem';
        errorElement.style.marginTop = '5px';
        field.parentElement.appendChild(errorElement);
        return errorElement;
    }

    saveStepData(step) {
        const stepElement = document.getElementById(`step${step}`);
        const inputs = stepElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name) {
                this.formData[input.name] = input.value;
            }
        });
    }

    updateReviewSection() {
        // Personal details
        document.getElementById('reviewName').textContent = this.formData.fullName || '-';
        document.getElementById('reviewEmail').textContent = this.formData.email || '-';
        document.getElementById('reviewPhone').textContent = this.formData.phone || '-';

        // Appointment details
        document.getElementById('reviewDepartment').textContent = 
            this.getDisplayValue('department', this.formData.department);
        document.getElementById('reviewDoctor').textContent = 
            this.getDisplayValue('doctor', this.formData.doctor);
        
        // Format date and time
        if (this.formData.appointmentDate && this.formData.appointmentTime) {
            const date = new Date(this.formData.appointmentDate);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = date.toLocaleDateString('en-US', options);
            document.getElementById('reviewDateTime').textContent = 
                `${formattedDate} at ${this.formData.appointmentTime}`;
        } else {
            document.getElementById('reviewDateTime').textContent = '-';
        }

        document.getElementById('reviewSymptoms').textContent = this.formData.symptoms || '-';
        document.getElementById('confirmEmail').textContent = this.formData.email || '';
    }

    getDisplayValue(fieldName, value) {
        const displayMap = {
            department: {
                'cardiology': 'Cardiology',
                'neurology': 'Neurology',
                'orthopedics': 'Orthopedics',
                'pediatrics': 'Pediatrics',
                'dermatology': 'Dermatology',
                'dentistry': 'Dentistry',
                'ophthalmology': 'Ophthalmology',
                'general': 'General Medicine'
            },
            doctor: {
                'dr_smith': 'Dr. Sarah Smith',
                'dr_johnson': 'Dr. Michael Johnson',
                'dr_williams': 'Dr. Emily Williams',
                'dr_brown': 'Dr. James Brown',
                '': 'Any Available Doctor'
            }
        };

        return displayMap[fieldName]?.[value] || value || '-';
    }

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appointmentDate').min = today;
    }

    loadDoctorOptions() {
        const department = document.getElementById('department').value;
        const doctorSelect = document.getElementById('doctor');
        
        // Clear existing options except first
        while (doctorSelect.options.length > 1) {
            doctorSelect.remove(1);
        }

        // Doctor data based on department
        const doctorsByDept = {
            'cardiology': [
                { value: 'dr_smith', name: 'Dr. Sarah Smith' },
                { value: 'dr_johnson', name: 'Dr. Michael Johnson' }
            ],
            'neurology': [
                { value: 'dr_williams', name: 'Dr. Emily Williams' }
            ],
            'orthopedics': [
                { value: 'dr_brown', name: 'Dr. James Brown' }
            ],
            'dentistry': [
                { value: 'dr_smith', name: 'Dr. Sarah Smith' }
            ],
            'ophthalmology': [
                { value: 'dr_williams', name: 'Dr. Emily Williams' }
            ]
        };

        const doctors = doctorsByDept[department] || [];
        
        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.value;
            option.textContent = doctor.name;
            doctorSelect.appendChild(option);
        });
    }

    async submitForm() {
        // Validate step 3
        if (!this.validateStep(3)) {
            return;
        }

        // Check terms agreement
        if (!document.getElementById('terms').checked) {
            this.showToast('Please agree to the Terms of Service to continue.', 'error');
            return;
        }

        // Save final step data
        this.saveStepData(3);

        // Show loading overlay
        this.showLoading(true);

        try {
            // Prepare form data
            const formData = new FormData();
            Object.entries(this.formData).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append('timestamp', new Date().toISOString());

            // Send to server (adjust URL as needed)
            const response = await fetch('http://localhost:5000/appointment', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const result = await response.json();
            
            // Hide loading
            this.showLoading(false);
            
            // Show success modal
            this.showModal();
            
            // Reset form
            this.resetForm();
            
            // Log to console (for debugging)
            console.log('Appointment submitted:', result);
            
            // Send confirmation email (simulated)
            this.sendConfirmationEmail();
            
        } catch (error) {
            this.showLoading(false);
            console.error('Submission error:', error);
            this.showToast('Failed to submit appointment. Please try again or call us directly.', 'error');
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = show ? 'flex' : 'none';
    }

    showModal() {
        document.getElementById('successModal').style.display = 'flex';
    }

    closeModal() {
        document.getElementById('successModal').style.display = 'none';
    }

    resetForm() {
        // Reset form data
        this.formData = {};
        this.currentStep = 1;
        
        // Reset form elements
        document.getElementById('appointmentForm').reset();
        
        // Reset steps
        this.showStep(1);
        
        // Reset review section
        this.updateReviewSection();
    }

    sendConfirmationEmail() {
        // In a real application, this would connect to your email service
        // For now, we'll simulate it
        console.log(`Confirmation email sent to: ${this.formData.email}`);
        
        // You could integrate with:
        // - SendGrid
        // - Mailgun
        // - AWS SES
        // - Your custom email server
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto-remove toast after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
        
        // Close button functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const appointmentForm = new AppointmentForm();
    
    // Add CSS for error states
    const style = document.createElement('style');
    style.textContent = `
        .error {
            border-color: #f82f56 !important;
            background-color: #fff5f5;
        }
        
        .error:focus {
            box-shadow: 0 0 0 3px rgba(248, 47, 86, 0.2) !important;
        }
        
        .field-error {
            color: #f82f56;
            font-size: 0.85rem;
            margin-top: 5px;
        }
    `;
    document.head.appendChild(style);
});