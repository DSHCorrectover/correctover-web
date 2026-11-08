#!/usr/bin/env python3
"""
Correctover SaaS Platform - Launch Announcement Email Sender
Sends launch announcement to all configured email channels
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sys

# Email configuration from .env
EMAIL_CONFIGS = [
    {
        "name": "Correctover Enterprise",
        "smtp_host": "smtp.qiye.163.com",
        "smtp_port": 465,
        "username": "wangguigui@correctover.com",
        "password": "kVtF6rgG#rP5ZFcV",
    },
    {
        "name": "163 Personal",
        "smtp_host": "smtp.163.com",
        "smtp_port": 465,
        "username": "wgg234114134@163.com",
        "password": "KRSxFuF2qtUqLAPh",
    },
    {
        "name": "Sina Mail",
        "smtp_host": "smtp.sina.com",
        "smtp_port": 465,
        "username": "correctover@sina.com",
        "password": "8860655129710956",
    },
]

def create_email_content():
    """Create launch announcement email content - paper-style design"""
    
    subject = "MCP Security Audit Platform - Now Accepting Founding Members"
    
    # Read the redesigned HTML template
    try:
        with open('launch-email-redesigned.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
    except FileNotFoundError:
        # Fallback to inline HTML if file not found
        html_content = "<html><body>Email template loading...</body></html>"
    
    text_content = """
MCP Security Audit Platform - Now Accepting Founding Members

Your clients are deploying MCP servers without security audits. We've found that 91.8% lack proper OAuth implementation — creating critical vulnerabilities in AI infrastructure.

Correctover delivers an independent audit layer based on IETF Internet-Draft standards, giving consulting firms the capability to offer comprehensive MCP security assessments.

Trusted by design partners: Cloudflare, Anthropic, Google, Microsoft, Amazon
Standards-based: draft-correctover-ccs-10 (IETF) | Zenodo DOI available
Proven scale: 42,163 servers audited across 7 dimensions

What You Get as a Founding Member:
• Complete audit delivery capability - White-label CCS reports for your existing consulting services
• 7-dimension parallel processing - Structure, Schema, Latency, Cost, Identity, Integrity, Security
• Multi-payment flexibility - Stripe, Alipay, USDC on Base chain, Wire Transfer
• Priority support & co-marketing - Direct access to our team and joint GTM opportunities

Investment Options:
Founding Member (Limited slots): ¥35,000
Standard License: ¥50,000
Enterprise (annual): ¥100,000/year
API Subscription: ¥199-799/month

🎁 Complimentary Pilot Program:
First 2-3 qualified partners receive a free pilot audit of one client's MCP server. No commitment required.

Limited to first 10 founding members at this pricing tier.

Request Founding Member Details: wangguigui@correctover.com

Questions? Reply directly to this email or contact: wangguigui@correctover.com

Correctover SaaS Platform | Independent MCP Security Audit Layer
Based on IETF Internet-Draft draft-correctover-ccs-10
    """
    
    return subject, html_content, text_content


def send_email(config, to_email, subject, html_content, text_content):
    """Send email using specified SMTP configuration"""
    
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = config['username']
        msg['To'] = to_email
        msg['Subject'] = subject
        
        part1 = MIMEText(text_content, 'plain', 'utf-8')
        part2 = MIMEText(html_content, 'html', 'utf-8')
        
        msg.attach(part1)
        msg.attach(part2)
        
        server = smtplib.SMTP_SSL(config['smtp_host'], config['smtp_port'], timeout=10)
        server.login(config['username'], config['password'])
        server.sendmail(config['username'], to_email, msg.as_string())
        server.quit()
        
        print(f"✓ Email sent successfully via {config['name']}")
        print(f"  From: {config['username']}")
        print(f"  To: {to_email}")
        return True
        
    except Exception as e:
        print(f"✗ Failed to send email via {config['name']}: {str(e)}")
        return False


def main():
    """Main function to send launch announcement"""
    
    print("=" * 60)
    print("Correctover SaaS - Launch Announcement Email Sender")
    print("=" * 60)
    print()
    
    subject, html_content, text_content = create_email_content()
    
    # Send to multiple recipients for redundancy
    recipients = [
        "wangguigui@correctover.com",
        "wgg234114134@163.com",
        "correctover@sina.com",
    ]
    
    results = []
    
    for recipient in recipients:
        print(f"\nSending to: {recipient}")
        print("-" * 60)
        
        success_count = 0
        for config in EMAIL_CONFIGS:
            if send_email(config, recipient, subject, html_content, text_content):
                success_count += 1
                break  # Stop after first successful send
        
        results.append({
            "recipient": recipient,
            "success": success_count > 0
        })
    
    # Summary
    print("\n" + "=" * 60)
    print("Email Sending Summary")
    print("=" * 60)
    
    for result in results:
        status = "✓ SUCCESS" if result['success'] else "✗ FAILED"
        print(f"{status} - {result['recipient']}")
    
    total_success = sum(1 for r in results if r['success'])
    print(f"\nTotal: {total_success}/{len(results)} emails sent successfully")
    
    if total_success > 0:
        print("\n🎉 Launch announcement sent!")
    else:
        print("\n⚠️  All email sends failed. Check SMTP credentials.")
    
    return 0 if total_success > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
