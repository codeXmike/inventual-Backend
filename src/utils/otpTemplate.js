export const otpHTML = (otp) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background: linear-gradient(135deg, #f5f5f5, #ffffff); border-radius: 12px; padding: 2.5rem 3rem; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
  <h1 style="text-align: center; color: #003366; font-size: 2.2rem; margin-bottom: 0.5rem;">Moni<span style="color: #FFA500;">POS</span></h1>
  <p style="text-align: center; color: #555; font-size: 0.95rem; margin-bottom: 2rem;">...your smart inventory & pos assistant</p>

  <h2 style="color: #2F855A; font-size: 1.3rem;">🔐 Email Verification</h2>
  <p style="color: #333; font-size: 1rem;">Use the OTP below to verify your email address:</p>

  <div style="background: #f0f0f0; border-radius: 8px; text-align: center; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #222; padding: 1rem 0; margin: 20px 0;">
    ${otp}
  </div>

  <p style="font-size: 0.95rem; color: #444;">This OTP is valid for the next <strong>10 minutes</strong>. If you didn’t request this, please ignore this message.</p>

  <hr style="margin: 2rem 0; border: none; border-top: 1px solid #ddd;" />

  <p style="font-size: 0.8rem; color: #999; text-align: center;">Sent from MoniPOS • No reply needed</p>
</div>

`;
