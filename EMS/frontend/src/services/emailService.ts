import emailjs from '@emailjs/browser';

// ============================================================================
// EmailJS Service Configuration
// IMPORTANT: Replace these with your actual credentials from the EmailJS dashboard
// ============================================================================
export const EMAILJS_CONFIG = {
  SERVICE_ID: (import.meta.env.VITE_EMAILJS_SERVICE_ID as string) || 'YOUR_SERVICE_ID_HERE',   // e.g. service_xxxxxxx
  TEMPLATE_ID: (import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string) || 'YOUR_TEMPLATE_ID_HERE', // e.g. template_xxxxxxx
  PUBLIC_KEY: (import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string) || 'YOUR_PUBLIC_KEY_HERE',   // e.g. XXXXXXXXXXXXXXXXX
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

export const emailService = {
  /**
   * Sends an OTP email to the specified address.
   * Make sure your EmailJS template has a variable {{otp}}
   */
  async sendOTP(email: string, otp: string, userName: string = 'User'): Promise<boolean> {
    try {
      if (EMAILJS_CONFIG.SERVICE_ID.includes('YOUR_')) {
        console.warn('EmailJS is not configured. Simulating email send. OTP:', otp);
        return true;
      }

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          to_email: email,
          to_name: userName,
          otp: otp,
        },
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      
      return true;
    } catch (error) {
      console.error('EmailJS Error:', error);
      return false;
    }
  },

  /**
   * Generates a random 6-digit OTP
   */
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
};
