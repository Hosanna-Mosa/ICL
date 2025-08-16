import { sendEmail } from "../utils/emailService.js";
import Settings from "../models/Settings.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";

/**
 * Submit contact form
 * @route POST /api/contact
 * @access Public
 */
export const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      throw new ApiError(400, "Name, email, and message are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, "Please provide a valid email address");
    }

    // Get admin email from settings
    const settings = await Settings.findOne();
    const adminEmail = settings?.general?.contactEmail || "brelisbrelis1@gmail.com";

    // Create email HTML content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Contact Details</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString('en-US', { 
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
          <h3 style="color: #333; margin-top: 0;">Message</h3>
          <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d;">
          <p>This message was sent from the BRELIS Streetwear contact form.</p>
          <p>You can reply directly to this email to respond to ${name}.</p>
        </div>
      </div>
    `;

    // Send email to admin
    await sendEmail({
      to: adminEmail,
      subject: `New Contact Form Submission from ${name}`,
      html: emailHtml,
    });

    // Send confirmation email to user
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          Thank You for Contacting BRELIS Streetwear
        </h2>
        
        <p>Dear ${name},</p>
        
        <p>Thank you for reaching out to us! We have received your message and will get back to you as soon as possible.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Your Message</h3>
          <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <p>In the meantime, you can also reach us through:</p>
        <ul>
          <li><strong>WhatsApp:</strong> +91 93810 32323</li>
          <li><strong>Instagram:</strong> @brelis_streetwear</li>
          <li><strong>Email:</strong> brelisbrelis1@gmail.com</li>
        </ul>
        
        <p>We typically respond within 24 hours during business days.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d;">
          <p>Best regards,<br>The BRELIS Streetwear Team</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "Thank you for contacting BRELIS Streetwear",
      html: userEmailHtml,
    });

    return res.status(200).json(
      new ApiResponse(200, { name, email }, "Contact form submitted successfully. We'll get back to you soon!")
    );

  } catch (error) {
    next(error);
  }
};
