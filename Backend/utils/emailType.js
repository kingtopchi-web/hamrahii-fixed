export const emailTypes = {
  FORGOT_PASSWORD: {
    subject: "HumRahii • Password Reset OTP",
    template: ({ name, otp }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset - HumRahii</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background: linear-gradient(135deg, #fef3c7 0%, #fef3c7 30%, #fee2e2 100%); font-family: 'Inter', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:20px; padding:40px; box-shadow:0 20px 60px rgba(239, 68, 68, 0.15); border: 1px solid rgba(254, 226, 226, 0.5);">

          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 12px; border-radius: 14px; margin-bottom: 16px;">
                <span style="color: white; font-size: 24px; font-weight: 700;">🚗</span>
              </div>
              <h1 style="margin:0; font-size:32px; font-weight: 800; letter-spacing:-0.5px;">
                <span style="background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Hum</span>
                <span style="color:#1f2937;">Rahii</span>
              </h1>
              <p style="margin:4px 0 0; color:#6b7280; font-size:14px; font-weight:500;">Ride together, save together</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding-bottom:16px;">
              <h2 style="margin:0; color:#1f2937; font-size:24px; font-weight:700;">
                Hello ${name}! 👋
              </h2>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0; color:#4b5563; font-size:16px; line-height:1.7;">
                We received a request to reset your <strong style="color:#ef4444;">HumRahii</strong> account password. 
                Please use the OTP below to continue securing your account.
              </p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td align="center" style="padding:30px 0;">
              <div style="
                display:inline-block;
                background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
                color:#ffffff;
                font-size:32px;
                font-weight:800;
                padding:20px 48px;
                border-radius:16px;
                letter-spacing:8px;
                box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.2);
              ">
                ${otp}
              </div>
            </td>
          </tr>

          <!-- Warning Box -->
          <tr>
            <td style="padding-bottom:30px;">
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef3c7 100%); border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 12px;">
                <p style="margin:0; color:#92400e; font-size:14px; line-height:1.6; font-weight:500;">
                  ⏱ <strong>Valid for 5 minutes</strong> - Use it quickly!<br/>
                  🔒 <strong>Never share</strong> this OTP with anyone.<br/>
                  ❌ If you didn't request this, please ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <a href="#" style="
                display: inline-block;
                background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
                color: white;
                text-decoration: none;
                font-weight: 600;
                font-size: 15px;
                padding: 14px 32px;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
              ">
                Reset Password Now →
              </a>
            </td>
          </tr>

          <!-- Help Section -->
          <tr>
            <td style="padding:20px; background: linear-gradient(135deg, #fef2f2 0%, #fffbeb 100%); border-radius: 12px; border: 1px solid #fecaca;">
              <p style="margin:0; color:#7c2d12; font-size:14px; line-height:1.6; text-align: center; font-weight: 500;">
                Need help? Contact our support team at 
                <a href="mailto:support@humrahii.com" style="color:#dc2626; text-decoration:none; font-weight:600;">support@humrahii.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:40px;">
              <div style="width:100%; height:1px; background: linear-gradient(90deg, #fee2e2 0%, #fecaca 50%, #fee2e2 100%); margin-bottom:24px;"></div>
              
              <!-- Social Links -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="padding:0 8px;">
                    <a href="#" style="display:inline-block; width:36px; height:36px; background:#f3f4f6; border-radius:10px; text-align:center; line-height:36px; color:#9ca3af;">📱</a>
                  </td>
                  <td style="padding:0 8px;">
                    <a href="#" style="display:inline-block; width:36px; height:36px; background:#f3f4f6; border-radius:10px; text-align:center; line-height:36px; color:#9ca3af;">📧</a>
                  </td>
                  <td style="padding:0 8px;">
                    <a href="#" style="display:inline-block; width:36px; height:36px; background:#f3f4f6; border-radius:10px; text-align:center; line-height:36px; color:#9ca3af;">🐦</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0; color:#9ca3af; font-size:12px; line-height:1.6;">
                © ${new Date().getFullYear()} HumRahii Technologies Pvt. Ltd.<br/>
                123 Tech Park, Bangalore, Karnataka 560001
              </p>
              
              <p style="margin:12px 0 0; color:#d1d5db; font-size:11px;">
                This email was sent to you because you requested a password reset on HumRahii.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    `,
  },

  WELCOME_EMAIL: {
    subject: "Welcome to HumRahii! 🚗 Start Your Journey",
    template: ({ name }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Humrahii</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background: linear-gradient(135deg, #fef3c7 0%, #fef3c7 30%, #fee2e2 100%); font-family: 'Inter', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:20px; padding:40px; box-shadow:0 20px 60px rgba(239, 68, 68, 0.15); border: 1px solid rgba(254, 226, 226, 0.5);">

          <!-- Welcome Header -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 16px; border-radius: 16px; margin-bottom: 20px;">
                <span style="color: white; font-size: 32px; font-weight: 700;">🎉</span>
              </div>
              <h1 style="margin:0; font-size:36px; font-weight: 800; letter-spacing:-0.5px; line-height:1.2;">
                <span style="color : black;">Welcome to Humrahii!</span>
              </h1>
              <p style="margin:8px 0 0; color:#6b7280; font-size:16px; font-weight:500;">Ride together, save together</p>
            </td>
          </tr>

          <!-- Personalized Greeting -->
          <tr>
            <td style="padding-bottom:24px;">
              <h2 style="margin:0; color:#1f2937; font-size:24px; font-weight:700;">
                Hi ${name}! 🚗
              </h2>
              <p style="margin:16px 0 0; color:#4b5563; font-size:16px; line-height:1.7;">
                We're thrilled to have you join India's fastest-growing carpooling community. 
                Get ready to save money, reduce traffic, and make new connections on every journey!
              </p>
            </td>
          </tr>

          <!-- Quick Start Cards -->
          <tr>
            <td style="padding-bottom:30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 16px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #fef2f2 0%, #fef2f2 100%); border-radius: 14px; padding: 20px; border: 1px solid #fecaca;">
                    <h3 style="margin:0 0 12px 0; color:#dc2626; font-size:18px; font-weight:700;">1. Complete Profile</h3>
                    <p style="margin:0; color:#7c2d12; font-size:14px; line-height:1.6;">Add profile photo & verify ID to build trust</p>
                  </td>
                  <td style="background: linear-gradient(135deg, #fffbeb 0%, #fffbeb 100%); border-radius: 14px; padding: 20px; border: 1px solid #fbbf24;">
                    <h3 style="margin:0 0 12px 0; color:#d97706; font-size:18px; font-weight:700;">2. Find Your First Ride</h3>
                    <p style="margin:0; color:#92400e; font-size:14px; line-height:1.6;">Search for rides going your way</p>
                  </td>
                </tr>
                <tr>
                  <td style="background: linear-gradient(135deg, #f0f9ff 0%, #f0f9ff 100%); border-radius: 14px; padding: 20px; border: 1px solid #7dd3fc;">
                    <h3 style="margin:0 0 12px 0; color:#0369a1; font-size:18px; font-weight:700;">3. Connect & Confirm</h3>
                    <p style="margin:0; color:#0c4a6e; font-size:14px; line-height:1.6;">Chat with riders & confirm details</p>
                  </td>
                  <td style="background: linear-gradient(135deg, #f5f3ff 0%, #f5f3ff 100%); border-radius: 14px; padding: 20px; border: 1px solid #c4b5fd;">
                    <h3 style="margin:0 0 12px 0; color:#7c3aed; font-size:18px; font-weight:700;">4. Ride & Review</h3>
                    <p style="margin:0; color:#5b21b6; font-size:14px; line-height:1.6;">Enjoy the journey & share feedback</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Stats Section -->
          <tr>
            <td style="padding:24px; background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 16px; margin-bottom: 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:10px;">
                    <div style="color:#ffffff; font-size:28px; font-weight:800; margin-bottom:4px;">500K+</div>
                    <div style="color:#d1d5db; font-size:12px; font-weight:600;">Happy Riders</div>
                  </td>
                  <td align="center" style="padding:10px;">
                    <div style="color:#ffffff; font-size:28px; font-weight:800; margin-bottom:4px;">₹10Cr+</div>
                    <div style="color:#d1d5db; font-size:12px; font-weight:600;">Saved by Users</div>
                  </td>
                  <td align="center" style="padding:10px;">
                    <div style="color:#ffffff; font-size:28px; font-weight:800; margin-bottom:4px;">4.8★</div>
                    <div style="color:#d1d5db; font-size:12px; font-weight:600;">Average Rating</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <a href="#" style="
                display: inline-block;
                background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
                color: white;
                text-decoration: none;
                font-weight: 700;
                font-size: 16px;
                padding: 16px 40px;
                border-radius: 14px;
                box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
                letter-spacing: 0.5px;
              ">
                🚀 Start Your First Ride
              </a>
            </td>
          </tr>

          <!-- Safety Note -->
          <tr>
            <td style="padding:20px; background: linear-gradient(135deg, #dcfce7 0%, #dcfce7 100%); border-radius: 14px; border: 1px solid #86efac;">
              <table width="100%">
                <tr>
                  <td width="48" style="vertical-align: top;">
                    <div style="background: #16a34a; color: white; width: 40px; height: 40px; border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px;">🛡️</div>
                  </td>
                  <td style="padding-left: 16px;">
                    <h3 style="margin:0 0 8px 0; color:#166534; font-size:16px; font-weight:700;">Your Safety is Our Priority</h3>
                    <p style="margin:0; color:#166534; font-size:14px; line-height:1.6;">
                      All users are verified, rides are tracked in real-time, and we have 24/7 support.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:40px;">
              <div style="width:100%; height:1px; background: linear-gradient(90deg, #fee2e2 0%, #fecaca 50%, #fee2e2 100%); margin-bottom:24px;"></div>
              
              <p style="margin:0 0 12px 0; color:#9ca3af; font-size:14px; line-height:1.6;">
                Download our app for the best experience:
              </p>
              
              <!-- App Store Buttons -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="padding:0 8px;">
                    <a href="#" style="display:inline-block; background:#1f2937; color:white; text-decoration:none; padding:12px 20px; border-radius:10px; font-size:14px; font-weight:600;">📱 App Store</a>
                  </td>
                  <td style="padding:0 8px;">
                    <a href="#" style="display:inline-block; background:#1f2937; color:white; text-decoration:none; padding:12px 20px; border-radius:10px; font-size:14px; font-weight:600;">▶️ Google Play</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0; color:#9ca3af; font-size:12px; line-height:1.6;">
                © ${new Date().getFullYear()} Humrahii Technologies Pvt. Ltd.<br/>
                Questions? <a href="mailto:help@Humrahii.com" style="color:#ef4444; text-decoration:none;">help@Humrahii.com</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    `,
  },

  PASSWORD_RESET_OTP: {
    subject: "Reset Your Humrahii Password 🔐",
    template: ({ name, otp, expiryMinutes }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Password - Humrahii</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background: linear-gradient(135deg, #fef3c7 0%, #fef3c7 30%, #fee2e2 100%); font-family: 'Inter', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:20px; padding:40px; box-shadow:0 20px 60px rgba(239, 68, 68, 0.15); border: 1px solid rgba(254, 226, 226, 0.5);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 16px; border-radius: 16px; margin-bottom: 20px;">
                <span style="color: white; font-size: 32px; font-weight: 700;">🔐</span>
              </div>
              <h1 style="margin:0; font-size:36px; font-weight: 800; letter-spacing:-0.5px; line-height:1.2;">
                <span style="color : black;">Password Reset</span>
              </h1>
              <p style="margin:8px 0 0; color:#6b7280; font-size:16px; font-weight:500;">Secure your Humrahii account</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding-bottom:24px;">
              <h2 style="margin:0; color:#1f2937; font-size:24px; font-weight:700;">
                Hi ${name},
              </h2>
              <p style="margin:16px 0 0; color:#4b5563; font-size:16px; line-height:1.7;">
                We received a request to reset your Humrahii password. Use the OTP below to verify your identity and create a new password.
              </p>
            </td>
          </tr>

          <!-- OTP Display -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 32px; border: 2px dashed #cbd5e1;">
                <p style="margin:0 0 16px 0; color:#64748b; font-size:14px; font-weight:600;">YOUR ONE-TIME PASSWORD</p>
                
                <!-- OTP Digits -->
                <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 24px;">
                  ${otp.split('').map(digit => `
                    <div style="
                      width: 60px;
                      height: 80px;
                      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                      color: white;
                      border-radius: 12px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 36px;
                      font-weight: 800;
                      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
                    ">
                      ${digit}
                    </div>
                  `).join('')}
                </div>
                
                <p style="margin:0; color:#ef4444; font-size:14px; font-weight:700; letter-spacing:0.5px;">
                  ⏰ Expires in ${expiryMinutes} minutes
                </p>
              </div>
            </td>
          </tr>

          <!-- Instructions -->
          <tr>
            <td style="padding-bottom:30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 16px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #eff6ff 0%, #eff6ff 100%); border-radius: 14px; padding: 20px; border: 1px solid #bfdbfe;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                      <div style="background: #3b82f6; color: white; width: 36px; height: 36px; border-radius: 10px; text-align: center; line-height: 36px; font-size: 18px;">1️⃣</div>
                      <div>
                        <h3 style="margin:0 0 4px 0; color:#1e40af; font-size:16px; font-weight:700;">Enter OTP</h3>
                        <p style="margin:0; color:#1e3a8a; font-size:14px; line-height:1.6;">Use the code above on our website or app</p>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background: linear-gradient(135deg, #fef2f2 0%, #fef2f2 100%); border-radius: 14px; padding: 20px; border: 1px solid #fecaca;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                      <div style="background: #ef4444; color: white; width: 36px; height: 36px; border-radius: 10px; text-align: center; line-height: 36px; font-size: 18px;">2️⃣</div>
                      <div>
                        <h3 style="margin:0 0 4px 0; color:#b91c1c; font-size:16px; font-weight:700;">Create New Password</h3>
                        <p style="margin:0; color:#991b1b; font-size:14px; line-height:1.6;">Choose a strong, unique password</p>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Warning -->
          <tr>
            <td style="padding:20px; background: linear-gradient(135deg, #fef3c7 0%, #fef3c7 100%); border-radius: 14px; border: 1px solid #fcd34d; margin-bottom: 24px;">
              <table width="100%">
                <tr>
                  <td width="48" style="vertical-align: top;">
                    <div style="background: #d97706; color: white; width: 40px; height: 40px; border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px;">⚠️</div>
                  </td>
                  <td style="padding-left: 16px;">
                    <h3 style="margin:0 0 8px 0; color:#92400e; font-size:16px; font-weight:700;">Security Alert</h3>
                    <p style="margin:0; color:#92400e; font-size:14px; line-height:1.6;">
                      • Never share this OTP with anyone<br/>
                      • Humrahii will never ask for your password via email<br/>
                      • This OTP is valid for one use only<br/>
                      • If you didn't request this, ignore this email
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td style="padding-bottom:30px;">
              <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 14px; padding: 20px;">
                <table width="100%">
                  <tr>
                    <td width="48" style="vertical-align: top;">
                      <div style="background: #10b981; color: white; width: 40px; height: 40px; border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px;">💬</div>
                    </td>
                    <td style="padding-left: 16px;">
                      <h3 style="margin:0 0 8px 0; color:#ffffff; font-size:16px; font-weight:700;">Need Help?</h3>
                      <p style="margin:0; color:#d1d5db; font-size:14px; line-height:1.6;">
                        Contact our support team:<br/>
                        📧 <a href="mailto:security@Humrahii.com" style="color:#60a5fa; text-decoration:none;">security@Humrahii.com</a><br/>
                        📞 +91-XXXXXXXXXX (24/7)
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:20px;">
              <div style="width:100%; height:1px; background: linear-gradient(90deg, #fee2e2 0%, #fecaca 50%, #fee2e2 100%); margin-bottom:24px;"></div>
              
              <p style="margin:0 0 16px 0; color:#9ca3af; font-size:14px; line-height:1.6;">
                For your security, this email was sent to you because of a password reset request.
              </p>

              <p style="margin:0; color:#9ca3af; font-size:12px; line-height:1.6;">
                © ${new Date().getFullYear()} Humrahii Technologies Pvt. Ltd.<br/>
                Securing your journeys, always.
              </p>
              
              <div style="margin-top: 24px; padding: 12px; background: #f3f4f6; border-radius: 8px; display: inline-block;">
                <p style="margin:0; color:#6b7280; font-size:11px;">
                  🔒 This is an automated security email. Please do not reply.
                </p>
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    `,
  },

  RIDE_CONFIRMED: {
    subject: "🎉 Your Humrahii Ride is Confirmed!",
    template: ({ name, from, to, date, time, driverName, amount }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Ride Confirmed - Humrahii</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background: linear-gradient(135deg, #fef3c7 0%, #fef3c7 30%, #fee2e2 100%); font-family: 'Inter', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:20px; padding:40px; box-shadow:0 20px 60px rgba(239, 68, 68, 0.15); border: 1px solid rgba(254, 226, 226, 0.5);">

          <!-- Confirmation Header -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 16px; border-radius: 16px; margin-bottom: 20px;">
                <span style="color: white; font-size: 32px; font-weight: 700;">✅</span>
              </div>
              <h1 style="margin:0; font-size:32px; font-weight: 800; letter-spacing:-0.5px;">
                <span style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Ride Confirmed!</span>
              </h1>
              <p style="margin:8px 0 0; color:#6b7280; font-size:16px; font-weight:500;">Your journey is all set, ${name}!</p>
            </td>
          </tr>

          <!-- Ride Details Card -->
          <tr>
            <td style="padding-bottom:30px;">
              <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 18px; padding: 30px; color: white;">
                
                <!-- Route -->
                <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                  <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <div style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%; margin-right: 12px;"></div>
                    <div style="font-size: 18px; font-weight: 600;">${from}</div>
                  </div>
                  <div style="border-left: 2px dashed rgba(255, 255, 255, 0.3); height: 24px; margin-left: 5px;"></div>
                  <div style="display: flex; align-items: center;">
                    <div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%; margin-right: 12px;"></div>
                    <div style="font-size: 18px; font-weight: 600;">${to}</div>
                  </div>
                </div>

                <!-- Details Grid -->
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 16px;">
                  <tr>
                    <td style="background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-align: center;">
                      <div style="color:#d1d5db; font-size:12px; font-weight:600; margin-bottom:4px;">📅 DATE</div>
                      <div style="color:white; font-size:16px; font-weight:700;">${date}</div>
                    </td>
                    <td style="background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-align: center;">
                      <div style="color:#d1d5db; font-size:12px; font-weight:600; margin-bottom:4px;">⏰ TIME</div>
                      <div style="color:white; font-size:16px; font-weight:700;">${time}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-align: center;">
                      <div style="color:#d1d5db; font-size:12px; font-weight:600; margin-bottom:4px;">👤 DRIVER</div>
                      <div style="color:white; font-size:16px; font-weight:700;">${driverName}</div>
                    </td>
                    <td style="background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-align: center;">
                      <div style="color:#d1d5db; font-size:12px; font-weight:600; margin-bottom:4px;">💰 AMOUNT</div>
                      <div style="color:white; font-size:16px; font-weight:700;">₹${amount}</div>
                    </td>
                  </tr>
                </table>

              </div>
            </td>
          </tr>

          <!-- Next Steps -->
          <tr>
            <td style="padding-bottom:30px;">
              <h3 style="margin:0 0 16px 0; color:#1f2937; font-size:20px; font-weight:700;">📋 Next Steps</h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 12px;">
                <tr>
                  <td style="vertical-align: top; width: 40px;">
                    <div style="background: #fef3c7; color: #d97706; width: 32px; height: 32px; border-radius: 8px; text-align: center; line-height: 32px; font-weight: 700;">1</div>
                  </td>
                  <td>
                    <div style="color:#1f2937; font-size:15px; font-weight:600; margin-bottom:4px;">Reach Pickup Point</div>
                    <div style="color:#6b7280; font-size:14px;">Arrive 5 minutes before scheduled time</div>
                  </td>
                </tr>
                <tr>
                  <td style="vertical-align: top;">
                    <div style="background: #fef3c7; color: #d97706; width: 32px; height: 32px; border-radius: 8px; text-align: center; line-height: 32px; font-weight: 700;">2</div>
                  </td>
                  <td>
                    <div style="color:#1f2937; font-size:15px; font-weight:600; margin-bottom:4px;">Verify Driver</div>
                    <div style="color:#6b7280; font-size:14px;">Check vehicle number & driver details</div>
                  </td>
                </tr>
                <tr>
                  <td style="vertical-align: top;">
                    <div style="background: #fef3c7; color: #d97706; width: 32px; height: 32px; border-radius: 8px; text-align: center; line-height: 32px; font-weight: 700;">3</div>
                  </td>
                  <td>
                    <div style="color:#1f2937; font-size:15px; font-weight:600; margin-bottom:4px;">Enjoy Your Ride</div>
                    <div style="color:#6b7280; font-size:14px;">Track your journey in real-time</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Buttons -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="padding:0 8px;">
                    <a href="#" style="
                      display: inline-block;
                      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                      color: white;
                      text-decoration: none;
                      font-weight: 600;
                      font-size: 14px;
                      padding: 14px 24px;
                      border-radius: 12px;
                    ">
                      📍 View on Map
                    </a>
                  </td>
                  <td style="padding:0 8px;">
                    <a href="#" style="
                      display: inline-block;
                      background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
                      color: white;
                      text-decoration: none;
                      font-weight: 600;
                      font-size: 14px;
                      padding: 14px 24px;
                      border-radius: 12px;
                    ">
                      💬 Chat with Driver
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Safety Reminder -->
          <tr>
            <td style="padding:20px; background: linear-gradient(135deg, #fef2f2 0%, #fffbeb 100%); border-radius: 14px; border: 1px solid #fecaca;">
              <table width="100%">
                <tr>
                  <td width="48" style="vertical-align: top;">
                    <div style="background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: white; width: 40px; height: 40px; border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px;">🛡️</div>
                  </td>
                  <td style="padding-left: 16px;">
                    <h3 style="margin:0 0 8px 0; color:#dc2626; font-size:16px; font-weight:700;">Safety First</h3>
                    <p style="margin:0; color:#7c2d12; font-size:14px; line-height:1.6;">
                      • Share ride details with family/friends<br/>
                      • Call emergency (1800-123-4567) if needed<br/>
                      • Rate your ride after completion
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:30px;">
              <div style="width:100%; height:1px; background: linear-gradient(90deg, #fee2e2 0%, #fecaca 50%, #fee2e2 100%); margin-bottom:20px;"></div>
              
              <p style="margin:0; color:#9ca3af; font-size:12px; line-height:1.6;">
                This is an automated confirmation. Please do not reply to this email.<br/>
                Need help? <a href="mailto:support@Humrahii.com" style="color:#ef4444; text-decoration:none;">Contact Support</a>
              </p>
              
              <p style="margin:12px 0 0; color:#d1d5db; font-size:11px;">
                © ${new Date().getFullYear()} Humrahii • Ride together, save together
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    `,
  },

  PAYMENT_SUCCESS: {
    subject: "✅ Payment Successful - Humrahii",
    template: ({ name, amount, rideDetails }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Successful - Humrahii</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background: linear-gradient(135deg, #fef3c7 0%, #fef3c7 30%, #fee2e2 100%); font-family: 'Inter', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:20px; padding:40px; box-shadow:0 20px 60px rgba(239, 68, 68, 0.15); border: 1px solid rgba(254, 226, 226, 0.5);">

          <!-- Success Header -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 16px; border-radius: 16px; margin-bottom: 20px;">
                <span style="color: white; font-size: 32px; font-weight: 700;">💰</span>
              </div>
              <h1 style="margin:0; font-size:32px; font-weight: 800; letter-spacing:-0.5px;">
                <span style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Payment Successful!</span>
              </h1>
              <p style="margin:8px 0 0; color:#6b7280; font-size:16px; font-weight:500;">Your payment of ₹${amount} has been processed</p>
            </td>
          </tr>

          <!-- Payment Details -->
          <tr>
            <td style="padding-bottom:30px;">
              <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 18px; padding: 30px; color: white;">
                
                <table width="100%">
                  <tr>
                    <td style="padding-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                      <div style="color:#d1d5db; font-size:14px; margin-bottom:8px;">Transaction ID</div>
                      <div style="color:white; font-size:18px; font-weight:700; font-family: monospace;">HAM${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 20px;">
                      <table width="100%">
                        <tr>
                          <td>
                            <div style="color:#d1d5db; font-size:14px; margin-bottom:4px;">Amount Paid</div>
                            <div style="color:white; font-size:24px; font-weight:800;">₹${amount}</div>
                          </td>
                          <td align="right">
                            <div style="color:#d1d5db; font-size:14px; margin-bottom:4px;">Date & Time</div>
                            <div style="color:white; font-size:14px; font-weight:600;">${new Date().toLocaleString('en-IN')}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Ride Details -->
                <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                  <div style="color:#d1d5db; font-size:14px; margin-bottom:12px;">For Ride:</div>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                      <div style="color:white; font-size:16px; font-weight:600;">${rideDetails}</div>
                      <div style="color:#9ca3af; font-size:14px; margin-top:4px;">Status: Confirmed ✅</div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.1); padding: 8px 16px; border-radius: 10px; color: #10b981; font-size: 14px; font-weight: 600;">
                      PAID
                    </div>
                  </div>
                </div>

              </div>
            </td>
          </tr>

          <!-- Next Steps -->
          <tr>
            <td style="padding-bottom:30px;">
              <h3 style="margin:0 0 16px 0; color:#1f2937; font-size:20px; font-weight:700;">📄 What's Next?</h3>
              
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #f0f9ff 100%); border-radius: 14px; padding: 20px; border: 1px solid #7dd3fc;">
                <div style="color:#0369a1; font-size:16px; font-weight:600; margin-bottom:12px;">Your ride is confirmed!</div>
                <div style="color:#0c4a6e; font-size:14px; line-height:1.6;">
                  • You'll receive ride details shortly<br/>
                  • Track your ride in real-time<br/>
                  • Contact support if you have questions
                </div>
              </div>
            </td>
          </tr>

          <!-- Receipt Download -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <a href="#" style="
                display: inline-block;
                background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
                color: white;
                text-decoration: none;
                font-weight: 600;
                font-size: 15px;
                padding: 14px 32px;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
              ">
                📥 Download Receipt
              </a>
            </td>
          </tr>

          <!-- Support Info -->
          <tr>
            <td style="padding:20px; background: linear-gradient(135deg, #fef2f2 0%, #fef2f2 100%); border-radius: 14px; border: 1px solid #fecaca;">
              <table width="100%">
                <tr>
                  <td width="48" style="vertical-align: top;">
                    <div style="background: #ef4444; color: white; width: 40px; height: 40px; border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px;">💁</div>
                  </td>
                  <td style="padding-left: 16px;">
                    <h3 style="margin:0 0 8px 0; color:#dc2626; font-size:16px; font-weight:700;">Need Help?</h3>
                    <p style="margin:0; color:#7c2d12; font-size:14px; line-height:1.6;">
                      Email: <a href="mailto:support@Humrahii.com" style="color:#dc2626; text-decoration:none; font-weight:600;">support@Humrahii.com</a><br/>
                      Phone: <span style="color:#dc2626; font-weight:600;">1800-123-4567</span> (24/7)
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:30px;">
              <div style="width:100%; height:1px; background: linear-gradient(90deg, #fee2e2 0%, #fecaca 50%, #fee2e2 100%); margin-bottom:20px;"></div>
              
              <p style="margin:0; color:#9ca3af; font-size:12px; line-height:1.6;">
                This is an automated receipt. Please save it for your records.<br/>
                © ${new Date().getFullYear()} Humrahii Technologies Pvt. Ltd.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    `,
  },

  ADMIN_LOGIN_OTP: {
    subject: "🔐 Admin Access - Your Login OTP",
    template: ({ name, otp, expiresIn = "2 minutes" }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Admin Login OTP - Humrahii</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @media only screen and (max-width: 600px) {
      .container {
        padding: 20px 15px !important;
      }
      .main-card {
        padding: 30px 20px !important;
        border-radius: 16px !important;
      }
      .otp-container {
        gap: 12px !important;
      }
      .otp-digit {
        width: 45px !important;
        height: 60px !important;
        font-size: 28px !important;
      }
    }
  </style>
</head>
<body style="margin:0; padding:0; background: linear-gradient(135deg, #fef3c7 0%, #fef3c7 30%, #fee2e2 100%); font-family: 'Inter', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" class="container" style="padding:40px 20px;">
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table width="100%" cellpadding="0" cellspacing="0" class="main-card" style="max-width:580px; background:#ffffff; border-radius:20px; padding:40px; box-shadow:0 20px 60px rgba(225, 6, 0, 0.12); border: 1px solid #E5E5E5;">

          <!-- Security Header -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #111111 0%, #333333 100%); padding: 18px; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(17, 17, 17, 0.2);">
                <span style="color: #E10600; font-size: 36px; font-weight: 700;">🔐</span>
              </div>
              <h1 style="margin:0; font-size:32px; font-weight: 800; letter-spacing:-0.5px; color: #111111;">
                Admin Access Required
              </h1>
              <p style="margin:8px 0 0; color:#555555; font-size:16px; font-weight:500;">Secure One-Time Password for admin login</p>
            </td>
          </tr>

          <!-- Welcome Message -->
          <tr>
            <td style="padding-bottom:25px;">
              <h2 style="margin:0 0 12px 0; font-size:20px; font-weight:600; color: #111111;">Hello ${name || 'Admin'},</h2>
              <p style="margin:0; color:#555555; font-size:15px; line-height:1.6;">
                You've requested access to the Humrahii Admin Portal. Use the OTP below to complete your login. 
                This code expires in <strong style="color:#E10600;">${expiresIn}</strong>.
              </p>
            </td>
          </tr>

          <!-- OTP Display -->
          <tr>
            <td style="padding-bottom:30px;" align="center">
              <div style="background: linear-gradient(135deg, #F7F7F7 0%, #FFFFFF 100%); border-radius: 18px; padding: 30px; border: 2px dashed #E10600; position: relative; overflow: hidden;">
                
               
                <div style="position: relative; z-index: 2;">
                  <div style="color:#555555; font-size:14px; font-weight:500; margin-bottom:15px; text-transform: uppercase; letter-spacing: 1px;">VERIFICATION CODE</div>
                  
               
                  
                  <div style="
                    background: linear-gradient(135deg, #E10600 0%, #C10500 100%);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-size: 28px;
                    font-weight: 800;
                    letter-spacing: 5px;
                    margin: 25px auto 15px;
                    display: inline-block;
                    box-shadow: 0 6px 20px rgba(225, 6, 0, 0.2);
                  ">
                    ${otp}
                  </div>
                  
                  <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px;">
                    <div style="width: 12px; height: 12px; background: #10B981; border-radius: 50%; animation: pulse 1.5s infinite;"></div>
                    <div style="color:#555555; font-size:14px; font-weight:500;">Active OTP • Expires in ${expiresIn}</div>
                  </div>
                </div>
              </div>
            </td>
          </tr>

          <!-- Security Instructions -->
          <tr>
            <td style="padding-bottom:25px;">
              <div style="background: linear-gradient(135deg, #F7F7F7 0%, #F7F7F7 100%); border-radius: 14px; padding: 24px; border-left: 4px solid #E10600;">
                <h3 style="margin:0 0 12px 0; color:#111111; font-size:18px; font-weight:700;">⚠️ Security Notice</h3>
                <ul style="margin:0; padding-left: 20px; color:#555555; font-size:14px; line-height:1.7;">
                  <li>This OTP is for admin access only</li>
                  <li>Never share this code with anyone</li>
                  <li>The code will expire after ${expiresIn}</li>
                  <li>If you didn't request this, please secure your account immediately</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Quick Login Instructions -->
          <tr>
            <td style="padding-bottom:30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #FFFFFF 0%, #F7F7F7 100%); border-radius: 14px; padding: 20px; border: 1px solid #E5E5E5;">
                <tr>
                  <td width="48" style="vertical-align: top;">
                    <div style="background: #E10600; color: white; width: 40px; height: 40px; border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px;">🚀</div>
                  </td>
                  <td style="padding-left: 16px;">
                    <h3 style="margin:0 0 8px 0; color:#111111; font-size:16px; font-weight:700;">Quick Steps</h3>
                    <div style="color:#555555; font-size:14px; line-height:1.6;">
                      1. Go to <a href="https://admin.Humrahii.com" style="color:#E10600; text-decoration:none; font-weight:600;">admin.Humrahii.com</a><br/>
                      2. Enter your admin credentials<br/>
                      3. Input the OTP above when prompted
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              <div style="width:100%; height:1px; background: linear-gradient(90deg, #FFFFFF 0%, #E5E5E5 50%, #FFFFFF 100%); margin-bottom:20px;"></div>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 10px 0; color:#555555; font-size:12px; line-height:1.6;">
                      This is an automated security message from Humrahii Admin System.
                    </p>
                    <p style="margin:0; color:#B8B8B8; font-size:11px;">
                      ⚠️ Unauthorized access is strictly prohibited.<br/>
                      © ${new Date().getFullYear()} Humrahii Admin Portal • All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <style>
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  </style>

</body>
</html>
    `,
  },

  RIDE_CREATED: {
    subject: "🚗 Your ride has been created - Humrahii",
    template: ({ name, ride }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Ride Created - Humrahii</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body style="margin:0; padding:0; background:#FFFFFF; font-family:Inter, Arial, sans-serif; color:#111111;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 15px;">
  <tr>
    <td align="center">

      <!-- Card -->
      <table width="100%" style="max-width:620px; background:#F7F7F7; border-radius:16px; border:1px solid #E5E5E5; padding:28px;">

        <!-- Header -->
        <tr>
          <td style="padding-bottom:20px;">
            <h1 style="margin:0; font-size:26px; font-weight:700;">
              Ride Created Successfully 🚗
            </h1>
            <p style="margin:8px 0 0; color:#555555; font-size:15px;">
              Hi ${name}, your ride is now live and visible to passengers.
            </p>
          </td>
        </tr>

        <!-- Route -->
        <tr>
          <td style="background:#FFFFFF; border:1px solid #E5E5E5; border-radius:14px; padding:20px; margin-bottom:16px;">
            <h3 style="margin:0 0 12px 0; font-size:17px;">Route</h3>

            <p style="margin:0; font-size:15px;">
              <strong>From:</strong> ${ride.from.city}<br/>
              <span style="color:#555555; font-size:13px;">${ride.from.address}</span>
            </p>

            <div style="height:12px;"></div>

            <p style="margin:0; font-size:15px;">
              <strong>To:</strong> ${ride.to.city}<br/>
              <span style="color:#555555; font-size:13px;">${ride.to.address}</span>
            </p>
          </td>
        </tr>

        <!-- Ride Info -->
        <tr>
          <td style="padding-top:16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF; border:1px solid #E5E5E5; border-radius:14px; padding:20px;">
              <tr>
                <td style="font-size:14px; color:#555;">Date</td>
                <td align="right" style="font-weight:600;">${ride.departureDate}</td>
              </tr>
              <tr><td colspan="2" style="height:10px;"></td></tr>
              <tr>
                <td style="font-size:14px; color:#555;">Time</td>
                <td align="right" style="font-weight:600;">${ride.departureTime}</td>
              </tr>
              <tr><td colspan="2" style="height:10px;"></td></tr>
              <tr>
                <td style="font-size:14px; color:#555;">Seats Available</td>
                <td align="right" style="font-weight:600;">${ride.totalSeats}</td>
              </tr>
              <tr><td colspan="2" style="height:10px;"></td></tr>
              <tr>
                <td style="font-size:14px; color:#555;">Price per Seat</td>
                <td align="right" style="font-weight:600;">₹${ride.pricePerSeat}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Car Details -->
        <tr>
          <td style="padding-top:16px;">
            <div style="background:#FFFFFF; border:1px solid #E5E5E5; border-radius:14px; padding:20px;">
              <h3 style="margin:0 0 10px 0;">Vehicle</h3>
              <p style="margin:0; font-size:14px;">
                ${ride.carDetails.brand} ${ride.carDetails.model} (${ride.carDetails.year})<br/>
                Seats: ${ride.carDetails.seats}<br/>
                Plate: ${ride.carDetails.plateNumber}
              </p>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td align="center" style="padding-top:26px;">
            <a href="#" style="
              background:#E10600;
              color:#FFFFFF;
              text-decoration:none;
              font-weight:600;
              font-size:15px;
              padding:14px 28px;
              border-radius:12px;
              display:inline-block;">
              View Ride
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:30px;">
            <div style="height:1px; background:#E5E5E5; margin-bottom:16px;"></div>
            <p style="margin:0; font-size:12px; color:#555555;">
              © ${new Date().getFullYear()} Humrahii Technologies Pvt. Ltd.<br/>
              This is an automated message.
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
`
  },

  GENERIC_STATUS_NOTIFICATION: {
    subject: "📩 Account status updated by Humrahii",

    template: ({ name, email, message, status }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Status Update - Humrahii</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body style="margin:0; padding:0; background:#FFFFFF; font-family:Inter, Arial, sans-serif; color:#111111;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 15px;">
  <tr>
    <td align="center">

      <!-- Card -->
      <table width="100%" style="max-width:620px; background:#F7F7F7; border-radius:16px; border:1px solid #E5E5E5; padding:28px;">

        <!-- Header -->
        <tr>
          <td style="padding-bottom:20px;">
            <h1 style="margin:0; font-size:26px; font-weight:700;">
              Account Update
            </h1>
            <p style="margin:8px 0 0; color:#555555; font-size:15px;">
              Hi ${name}, here is an important update regarding your account.
            </p>
          </td>
        </tr>

        <!-- Status Box -->
        <tr>
          <td style="background:#FFFFFF; border:1px solid #E5E5E5; border-radius:14px; padding:20px;">
            <table width="100%">
              <tr>
                <td style="font-size:14px; color:#555;">Status</td>
                <td align="right" style="font-weight:600; color:#E10600;">
                  ${status}
                </td>
              </tr>
              <tr><td colspan="2" style="height:10px;"></td></tr>
              <tr>
                <td style="font-size:14px; color:#555;">Registered Email</td>
                <td align="right" style="font-weight:500;">${email}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="padding-top:16px;">
            <div style="background:#FFFFFF; border:1px solid #E5E5E5; border-radius:14px; padding:20px;">
              <h3 style="margin:0 0 10px 0; font-size:17px;">Message</h3>
              <p style="margin:0; font-size:14px; color:#555555; line-height:1.6;">
                ${message}
              </p>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td align="center" style="padding-top:26px;">
            <a href="#" style="
              background:#E10600;
              color:#FFFFFF;
              text-decoration:none;
              font-weight:600;
              font-size:15px;
              padding:14px 28px;
              border-radius:12px;
              display:inline-block;">
              Go to Dashboard
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:30px;">
            <div style="height:1px; background:#E5E5E5; margin-bottom:16px;"></div>
            <p style="margin:0; font-size:12px; color:#555555;">
              © ${new Date().getFullYear()} Humrahii Technologies Pvt. Ltd.<br/>
              This is an automated message. Please do not reply.
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
`
  },

  BOOKING_REQUEST_TEMPLATE: {
    subject: "🚗 New Ride Booking Request - Humrahii",

    template: ({
      passangerName,
      pickupCity,
      pickupAddress,
      pickupCoordinates,
      dropCity,
      dropAddress,
      dropCoordinates,
      seatsBooked,
      rideStart,
      rideEnd,
      departureDate,
      departureTime,
      userName
    }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Booking Request - Humrahii</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body style="margin:0; padding:0; background:#F8FAFC; font-family:'Inter', Arial, sans-serif; color:#1F2937;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 15px;">
  <tr>
    <td align="center">

      <!-- Main Card -->
      <table width="100%" style="max-width:620px; background:#FFFFFF; border-radius:20px; border:1px solid #E5E5E5; padding:28px;">

        <!-- Header -->
        <tr>
          <td style="padding-bottom:24px;">
            <h1 style="margin:0; font-size:26px; font-weight:700; color:#111111;">
              New Booking Request 🚗
            </h1>
            <p style="margin:8px 0 0; color:#555555; font-size:15px;">
              Hi ${userName}, you have received a new booking request for your ride.
            </p>
          </td>
        </tr>

        <!-- Passenger Details -->
        <tr>
          <td style="background:#F7F7F7; border:1px solid #E5E5E5; border-radius:14px; padding:20px; margin-bottom:20px;">
            <h3 style="margin:0 0 16px 0; font-size:18px; color:#111111;">Passenger Details</h3>
            <table width="100%">
              <tr>
                <td style="font-size:14px; color:#555; padding-bottom:8px;">Passenger Name</td>
                <td align="right" style="font-weight:600; color:#111111;">${passangerName}</td>
              </tr>
              <tr>
                <td style="font-size:14px; color:#555; padding-bottom:8px;">Seats Requested</td>
                <td align="right" style="font-weight:600; color:#DC6803;">${seatsBooked} seat(s)</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Ride Details -->
        <tr>
          <td style="padding-bottom:20px;">
            <div style="background:#FFFFFF; border:1px solid #E5E5E5; border-radius:14px; padding:20px;">
              <h3 style="margin:0 0 16px 0; font-size:18px; color:#111111;">Ride Details</h3>
              
              <!-- Route -->
              <div style="display:flex; align-items:flex-start; margin-bottom:16px;">
                <div style="width:20px; margin-right:12px;">
                  <div style="width:12px; height:12px; background:#10B981; border-radius:50%; margin-top:4px;"></div>
                  <div style="width:2px; height:40px; background:#E5E5E5; margin:4px auto;"></div>
                  <div style="width:12px; height:12px; background:#EF4444; border-radius:50%;"></div>
                </div>
                <div style="flex:1;">
                  <div style="margin-bottom:12px;">
                    <div style="font-weight:600; color:#111111;">Pickup Location</div>
                    <div style="font-size:14px; color:#555;">${pickupAddress}</div>
                    <div style="font-size:13px; color:#888;">${pickupCity}</div>
                  </div>
                  <div>
                    <div style="font-weight:600; color:#111111;">Drop Location</div>
                    <div style="font-size:14px; color:#555;">${dropAddress}</div>
                    <div style="font-size:13px; color:#888;">${dropCity}</div>
                  </div>
                </div>
              </div>

              <!-- Date & Time -->
              <table width="100%" style="border-top:1px solid #E5E5E5; padding-top:16px;">
                <tr>
                  <td>
                    <div style="font-size:14px; color:#555;">Departure Date</div>
                    <div style="font-weight:600; color:#111111;">${new Date(departureDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </td>
                  <td align="right">
                    <div style="font-size:14px; color:#555;">Departure Time</div>
                    <div style="font-weight:600; color:#111111;">${new Date(departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- Driver Ride Info -->
        <tr>
          <td style="background:#FFF7ED; border:1px solid #FDBA74; border-radius:14px; padding:20px; margin-bottom:24px;">
            <h3 style="margin:0 0 12px 0; font-size:16px; color:#9A3412;">Your Ride Information</h3>
            <table width="100%">
              <tr>
                <td style="font-size:14px; color:#9A3412;">Route</td>
                <td align="right" style="font-weight:600; color:#9A3412;">${rideStart} → ${rideEnd}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Action Buttons -->
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:12px;">
                  <a href="${process.env.FRONTEND_URL || '#'}/driver/bookings" style="
                    background:#10B981;
                    color:#FFFFFF;
                    text-decoration:none;
                    font-weight:600;
                    font-size:15px;
                    padding:14px 28px;
                    border-radius:10px;
                    display:inline-block;
                    width:100%;
                    text-align:center;
                    box-sizing:border-box;">
                    ✅ Accept Request
                  </a>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <a href="${process.env.FRONTEND_URL || '#'}/driver/bookings" style="
                    background:#F7F7F7;
                    color:#555555;
                    text-decoration:none;
                    font-weight:600;
                    font-size:15px;
                    padding:14px 28px;
                    border-radius:10px;
                    display:inline-block;
                    width:100%;
                    text-align:center;
                    box-sizing:border-box;
                    border:1px solid #E5E5E5;">
                    ❌ Decline Request
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:32px;">
            <div style="height:1px; background:#E5E5E5; margin-bottom:20px;"></div>
            <p style="margin:0; font-size:13px; color:#888888; line-height:1.5;">
              This booking request will expire in 24 hours if not actioned.<br/>
              Please respond promptly to ensure a smooth experience for both parties.
            </p>
            <p style="margin:20px 0 0; font-size:12px; color:#888888;">
              © ${new Date().getFullYear()} Humrahii Technologies Pvt. Ltd.<br/>
              This is an automated notification. Please do not reply to this email.
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
`
  },

  VERIFY_EMAIL: {
    subject: "Humrahii • Verify Your Email Address",
    template: ({ name, otp, expiryMinutes }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email Verification - Humrahii</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background: linear-gradient(135deg, #fef3c7 0%, #fef3c7 30%, #fee2e2 100%); font-family: 'Inter', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:20px; padding:40px; box-shadow:0 20px 60px rgba(239, 68, 68, 0.15); border: 1px solid rgba(254, 226, 226, 0.5);">

          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 12px; border-radius: 14px; margin-bottom: 16px;">
                <span style="color: white; font-size: 24px; font-weight: 700;">🚗</span>
              </div>
              <h1 style="margin:0; font-size:32px; font-weight: 800; letter-spacing:-0.5px;">
                <span style="background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Hum</span>
                <span style="color:#1f2937;">Rahii</span>
              </h1>
              <p style="margin:4px 0 0; color:#6b7280; font-size:14px; font-weight:500;">Ride together, save together</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding-bottom:16px;">
              <h2 style="margin:0; color:#1f2937; font-size:24px; font-weight:700;">
                Welcome ${name}! 👋
              </h2>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0; color:#4b5563; font-size:16px; line-height:1.7;">
                Thank you for signing up with <strong style="color:#ef4444;">Humrahii</strong>.
                Please verify your email address using the OTP below to activate your account.
              </p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td align="center" style="padding:30px 0;">
              <div style="
                display:inline-block;
                background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
                color:#ffffff;
                font-size:32px;
                font-weight:800;
                padding:20px 48px;
                border-radius:16px;
                letter-spacing:8px;
                box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.2);
              ">
                ${otp}
              </div>
            </td>
          </tr>

          <!-- Info Box -->
          <tr>
            <td style="padding-bottom:30px;">
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef3c7 100%); border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 12px;">
                <p style="margin:0; color:#92400e; font-size:14px; line-height:1.6; font-weight:500;">
                  ⏱ <p style="margin:0; color:#ef4444; font-size:14px; font-weight:700; letter-spacing:0.5px;">
                  ⏰ Expires in ${expiryMinutes} minutes
                </p>
                  🔐 This OTP is for email verification only.<br/>
                  ❌ If you did not create an account, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>


          <!-- Button -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <a href="#" style="
                display: inline-block;
                background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
                color: white;
                text-decoration: none;
                font-weight: 600;
                font-size: 15px;
                padding: 14px 32px;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
              ">
                Verify Email →
              </a>
            </td>
          </tr>

          <!-- Help Section -->
          <tr>
            <td style="padding:20px; background: linear-gradient(135deg, #fef2f2 0%, #fffbeb 100%); border-radius: 12px; border: 1px solid #fecaca;">
              <p style="margin:0; color:#7c2d12; font-size:14px; line-height:1.6; text-align: center; font-weight: 500;">
                Need help? Contact us at 
                <a href="mailto:support@Humrahii.com" style="color:#dc2626; text-decoration:none; font-weight:600;">support@Humrahii.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:40px;">
              <div style="width:100%; height:1px; background: linear-gradient(90deg, #fee2e2 0%, #fecaca 50%, #fee2e2 100%); margin-bottom:24px;"></div>

              <p style="margin:0; color:#9ca3af; font-size:12px; line-height:1.6;">
                © ${new Date().getFullYear()} Humrahii Technologies Pvt. Ltd.<br/>
                123 Tech Park, Bangalore, Karnataka 560001
              </p>

              <p style="margin:12px 0 0; color:#d1d5db; font-size:11px;">
                This email was sent to verify your Humrahii account.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `,
  },

  VERIFY_PHONE: {
    subject: "Humrahii • Verify Your Phone Number",
    template: ({ otp, phone }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Phone Verification - Humrahii</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background: linear-gradient(135deg, #fef3c7 0%, #fef3c7 30%, #fee2e2 100%); font-family: 'Inter', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:20px; padding:40px; box-shadow:0 20px 60px rgba(239, 68, 68, 0.15); border: 1px solid rgba(254, 226, 226, 0.5);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 12px; border-radius: 14px; margin-bottom: 16px;">
                <span style="color:white; font-size:24px; font-weight:700;">📱</span>
              </div>
              <h1 style="margin:0; font-size:32px; font-weight:800;">
                <span style="background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Hum</span>
                <span style="color:#1f2937;">Rahii</span>
              </h1>
              <p style="margin-top:4px; color:#6b7280; font-size:14px;">Ride together, save together</p>
            </td>
          </tr>


          <!-- Message -->
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0; color:#4b5563; font-size:16px; line-height:1.7;">
                We need to verify your phone number 
                <strong style="color:#ef4444;">${phone || ""}</strong> 
                to secure your <strong>Humrahii</strong> account.
                Please enter the OTP below in the app to continue.
              </p>
            </td>
          </tr>

          <!-- OTP -->
          <tr>
            <td align="center" style="padding:30px 0;">
              <div style="
                display:inline-block;
                background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
                color:#ffffff;
                font-size:32px;
                font-weight:800;
                padding:20px 48px;
                border-radius:16px;
                letter-spacing:8px;
                box-shadow:0 10px 30px rgba(239,68,68,0.3);
              ">
                ${otp}
              </div>
            </td>
          </tr>

          <!-- Info -->
          <tr>
            <td style="padding-bottom:30px;">
              <div style="background:#fef3c7; border-left:4px solid #f59e0b; padding:16px 20px; border-radius:12px;">
                <p style="margin:0; color:#92400e; font-size:14px; line-height:1.6;">
                  ⏱ <strong>OTP valid for 5 minutes</strong><br/>
                  🔒 Do not share this code with anyone<br/>
                  ❌ If this was not you, ignore this email
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <a href="#" style="
                display:inline-block;
                background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
                color:#ffffff;
                text-decoration:none;
                font-weight:600;
                padding:14px 32px;
                border-radius:12px;
              ">
                Verify Phone Number →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:40px;">
              <div style="height:1px; background:#fee2e2; margin-bottom:24px;"></div>
              <p style="margin:0; color:#9ca3af; font-size:12px;">
                © ${new Date().getFullYear()} Humrahii Technologies Pvt. Ltd.
              </p>
              <p style="margin-top:10px; color:#d1d5db; font-size:11px;">
                This email confirms phone number verification for your Humrahii account.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `,
  },


};