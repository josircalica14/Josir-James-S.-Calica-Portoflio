// ═══ Contact Page JavaScript ═══
// Handles: loading overlay, success modal, spotlight effects, email form submission

// ── Loading Overlay Functions ──
function showLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
}

// ── Success Modal Functions ──
function showSuccessModal(name) {
    const modal = document.getElementById('success-modal');
    const nameSpan = document.getElementById('modal-name');
    nameSpan.textContent = name;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeSuccessModal();
            }
        });
    }
});

// ── Contact Page Interactions ──
(function () {
    // Spotlight tracking on the CTA card (cursor-following glow)
    const cta = document.getElementById('ct-magnet');
    if (cta && window.matchMedia('(hover: hover)').matches) {
        cta.addEventListener('mousemove', (e) => {
            const r = cta.getBoundingClientRect();
            cta.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
            cta.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        });
    }

    // Spotlight tracking on the info card
    const card = document.getElementById('ct-card');
    if (card) {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
            card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        });
    }

    // EMAIL ME button: smooth-scroll to the form below
    const emailBtn = document.getElementById('ct-magnet');
    if (emailBtn) {
        emailBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector('.ct-form-wrap');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Move focus to the first field for keyboard users
                setTimeout(() => document.getElementById('ct-name')?.focus({ preventScroll: true }), 650);
            }
        });
    }

    // ── Conversational Stepper Form → EmailJS Direct Send ──
    const form = document.getElementById('ct-form');
    if (form) {
        // Initialize EmailJS with your public key
        emailjs.init('xkIonYkjREJuw2mwJ');
        
        const steps = [...form.querySelectorAll('.ct-step')];
        let step = 0;
        let isSending = false;

        const show = (n) => {
            steps[step].classList.remove('is-on');
            step = Math.max(0, Math.min(steps.length - 1, n));
            steps[step].classList.add('is-on');
            if (step === 1) {
                document.getElementById('ct-name-echo').textContent = document.getElementById('ct-name').value.trim() || 'you';
            }
        };

        const setError = (id, on) => document.getElementById(id).closest('.ct-step').classList.toggle('has-error', on);

        const validateStep = (n) => {
            if (n === 0) {
                const name = document.getElementById('ct-name').value.trim();
                return !!name;
            }
            if (n === 1) {
                const email = document.getElementById('ct-email').value.trim();
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            }
            if (n === 2) {
                const msg = document.getElementById('ct-message').value.trim();
                return !!msg;
            }
            return true;
        };

        const validateCurrent = () => {
            if (step === 0) {
                const name = document.getElementById('ct-name').value.trim();
                setError('ct-name', !name);
                return !!name;
            }
            if (step === 1) {
                const email = document.getElementById('ct-email').value.trim();
                const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                setError('ct-email', !ok);
                return ok;
            }
            if (step === 2) {
                const msg = document.getElementById('ct-message').value.trim();
                setError('ct-message', !msg);
                return !!msg;
            }
            return true;
        };

        form.querySelectorAll('.ct-step-next').forEach(btn => {
            btn.addEventListener('click', () => {
                if (step === 2) {
                    // Final send: validate everything and send via EmailJS
                    if (!(validateCurrent() && validateStep(0) && validateStep(1))) {
                        if (!validateStep(0)) { show(0); return; }
                        if (!validateStep(1)) { show(1); return; }
                        return;
                    }
                    
                    if (isSending) return;
                    isSending = true;
                    
                    const name = document.getElementById('ct-name').value.trim();
                    const email = document.getElementById('ct-email').value.trim();
                    const message = document.getElementById('ct-message').value.trim();
                    
                    // Update button text to show sending
                    btn.textContent = 'Sending...';
                    btn.disabled = true;
                    
                    // Show loading overlay
                    showLoadingOverlay();
                    
                    // Send both emails: notification to me + auto-reply to sender
                    Promise.all([
                        // 1. Send notification to me
                        emailjs.send('service_c8ecwfs', 'template_lmepmoa', {
                            from_name: name,
                            reply_to: email,
                            message: message,
                            to_email: 'josirjamesc@gmail.com'
                        }).then(res => {
                            console.log('✅ Notification email sent:', res);
                            return res;
                        }).catch(err => {
                            console.error('❌ Notification email failed:', err);
                            throw err;
                        }),
                        // 2. Send auto-reply to sender
                        emailjs.send('service_c8ecwfs', 'template_ee8mzni', {
                            recipient_name: name,
                            email: email
                        }).then(res => {
                            console.log('✅ Auto-reply email sent:', res);
                            return res;
                        }).catch(err => {
                            console.error('❌ Auto-reply email failed:', err);
                            throw err;
                        })
                    ]).then(
                        function(responses) {
                            console.log('Emails sent successfully!', responses);
                            // Hide loading overlay
                            hideLoadingOverlay();
                            show(3);
                            // Update final step message
                            steps[3].querySelector('.ct-q').innerHTML = 'Message sent! <em>I\'ll reply within 24 hours.</em>';
                            // Show success modal
                            showSuccessModal(name);
                            isSending = false;
                        },
                        function(error) {
                            console.error('Failed to send email:', error);
                            // Hide loading overlay
                            hideLoadingOverlay();
                            alert('Failed to send message. Please try again or email me directly at josirjamesc@gmail.com');
                            btn.textContent = 'Send it →';
                            btn.disabled = false;
                            isSending = false;
                        }
                    );
                    return;
                }
                
                // Regular step progression
                if (validateCurrent()) show(step + 1);
            });
        });

        form.querySelectorAll('.ct-step-back').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('ct-step-retry')) {
                    show(0);
                    form.reset();
                } else {
                    show(step - 1);
                }
            });
        });

        // Clear error on input
        form.querySelectorAll('.ct-step-input').forEach(inp => {
            inp.addEventListener('input', () => setError(inp.id, false));
        });
    }
})();
