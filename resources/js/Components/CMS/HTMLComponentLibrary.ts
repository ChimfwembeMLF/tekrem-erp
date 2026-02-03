/**
 * Pre-built HTML Component Library
 * Ready-to-use components for landing pages
 */

export const HTML_COMPONENTS = {
  hero: {
    id: 'hero',
    name: 'Hero Section',
    icon: '🎯',
    category: 'sections',
    preview: 'Large banner with heading and CTA',
    html: `
<section class="hero-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 120px 20px; text-align: center; min-height: 500px; display: flex; align-items: center; justify-content: center;">
  <div class="hero-content">
    <h1 style="font-size: 48px; margin-bottom: 20px; font-weight: bold;">Your Amazing Heading</h1>
    <p style="font-size: 20px; margin-bottom: 30px; opacity: 0.9;">Describe your offer or value proposition here</p>
    <a href="#" class="cta-button" style="display: inline-block; background: white; color: #667eea; padding: 15px 40px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 16px; transition: transform 0.2s;">Get Started</a>
  </div>
</section>
    `.trim(),
  },
  features: {
    id: 'features',
    name: 'Features Grid',
    icon: '✨',
    category: 'sections',
    preview: '3-column feature grid',
    html: `
<section class="features-section" style="padding: 80px 20px; background: #f8f9fa;">
  <h2 style="text-align: center; font-size: 36px; margin-bottom: 50px;">Key Features</h2>
  <div class="features-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto;">
    <div class="feature-card" style="background: white; padding: 30px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="font-size: 48px; margin-bottom: 15px;">🚀</div>
      <h3 style="margin-bottom: 10px;">Feature One</h3>
      <p style="color: #666;">Describe the benefit of this feature</p>
    </div>
    <div class="feature-card" style="background: white; padding: 30px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="font-size: 48px; margin-bottom: 15px;">⚡</div>
      <h3 style="margin-bottom: 10px;">Feature Two</h3>
      <p style="color: #666;">Describe the benefit of this feature</p>
    </div>
    <div class="feature-card" style="background: white; padding: 30px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="font-size: 48px; margin-bottom: 15px;">💎</div>
      <h3 style="margin-bottom: 10px;">Feature Three</h3>
      <p style="color: #666;">Describe the benefit of this feature</p>
    </div>
  </div>
</section>
    `.trim(),
  },
  cta: {
    id: 'cta',
    name: 'Call to Action',
    icon: '🎪',
    category: 'sections',
    preview: 'Full-width CTA banner',
    html: `
<section class="cta-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 20px; text-align: center;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h2 style="font-size: 36px; margin-bottom: 20px;">Ready to Get Started?</h2>
    <p style="font-size: 18px; margin-bottom: 30px; opacity: 0.9;">Join thousands of satisfied customers</p>
    <button style="background: white; color: #667eea; padding: 15px 40px; border: none; border-radius: 5px; font-weight: bold; font-size: 16px; cursor: pointer; transition: transform 0.2s;">Start Free Trial</button>
  </div>
</section>
    `.trim(),
  },
  testimonials: {
    id: 'testimonials',
    name: 'Testimonials',
    icon: '⭐',
    category: 'sections',
    preview: 'Customer testimonials carousel',
    html: `
<section class="testimonials-section" style="padding: 80px 20px; background: white;">
  <h2 style="text-align: center; font-size: 36px; margin-bottom: 50px;">What Our Customers Say</h2>
  <div class="testimonials-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto;">
    <div class="testimonial-card" style="background: #f8f9fa; padding: 30px; border-radius: 8px; border-left: 4px solid #667eea;">
      <div style="margin-bottom: 15px; font-size: 18px;">⭐⭐⭐⭐⭐</div>
      <p style="margin-bottom: 20px; color: #333;">This service exceeded all my expectations. Highly recommended!</p>
      <strong>John Doe</strong><br>
      <small style="color: #666;">CEO, Tech Company</small>
    </div>
    <div class="testimonial-card" style="background: #f8f9fa; padding: 30px; border-radius: 8px; border-left: 4px solid #667eea;">
      <div style="margin-bottom: 15px; font-size: 18px;">⭐⭐⭐⭐⭐</div>
      <p style="margin-bottom: 20px; color: #333;">Amazing quality and support. Worth every penny.</p>
      <strong>Jane Smith</strong><br>
      <small style="color: #666;">Marketing Director</small>
    </div>
  </div>
</section>
    `.trim(),
  },
  pricing: {
    id: 'pricing',
    name: 'Pricing Table',
    icon: '💰',
    category: 'sections',
    preview: '3-tier pricing cards',
    html: `
<section class="pricing-section" style="padding: 80px 20px; background: #f8f9fa;">
  <h2 style="text-align: center; font-size: 36px; margin-bottom: 50px;">Simple, Transparent Pricing</h2>
  <div class="pricing-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto;">
    <div class="pricing-card" style="background: white; padding: 40px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h3 style="margin-bottom: 10px;">Starter</h3>
      <div style="font-size: 36px; font-weight: bold; margin: 20px 0;">$29<small style="font-size: 18px;">/mo</small></div>
      <ul style="text-align: left; margin: 20px 0; list-style: none; padding: 0;">
        <li style="padding: 8px 0; border-bottom: 1px solid #eee;">✓ Feature 1</li>
        <li style="padding: 8px 0; border-bottom: 1px solid #eee;">✓ Feature 2</li>
        <li style="padding: 8px 0;">✓ Feature 3</li>
      </ul>
      <button style="width: 100%; background: #667eea; color: white; padding: 12px; border: none; border-radius: 5px; cursor: pointer;">Get Started</button>
    </div>
    <div class="pricing-card" style="background: #667eea; color: white; padding: 40px; border-radius: 8px; text-align: center; transform: scale(1.05); box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);">
      <h3 style="margin-bottom: 10px;">Professional</h3>
      <div style="font-size: 36px; font-weight: bold; margin: 20px 0;">$99<small style="font-size: 18px;">/mo</small></div>
      <ul style="text-align: left; margin: 20px 0; list-style: none; padding: 0;">
        <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.3);">✓ Feature 1</li>
        <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.3);">✓ Feature 2</li>
        <li style="padding: 8px 0;">✓ Feature 3</li>
      </ul>
      <button style="width: 100%; background: white; color: #667eea; padding: 12px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Get Started</button>
    </div>
  </div>
</section>
    `.trim(),
  },
  contact: {
    id: 'contact',
    name: 'Contact Form',
    icon: '📧',
    category: 'sections',
    preview: 'Contact form section',
    html: `
<section class="contact-section" style="padding: 80px 20px; background: white; max-width: 600px; margin: 0 auto;">
  <h2 style="text-align: center; font-size: 36px; margin-bottom: 10px;">Get in Touch</h2>
  <p style="text-align: center; color: #666; margin-bottom: 40px;">We'd love to hear from you. Send us a message!</p>
  <form style="display: grid; gap: 20px;">
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Name</label>
      <input type="text" placeholder="Your name" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; box-sizing: border-box;">
    </div>
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Email</label>
      <input type="email" placeholder="your@email.com" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; box-sizing: border-box;">
    </div>
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Message</label>
      <textarea placeholder="Your message..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; min-height: 120px; font-family: inherit; box-sizing: border-box;"></textarea>
    </div>
    <button type="submit" style="background: #667eea; color: white; padding: 15px; border: none; border-radius: 5px; font-weight: bold; font-size: 16px; cursor: pointer;">Send Message</button>
  </form>
</section>
    `.trim(),
  },
  team: {
    id: 'team',
    name: 'Team Members',
    icon: '👥',
    category: 'sections',
    preview: 'Team showcase grid',
    html: `
<section class="team-section" style="padding: 80px 20px; background: #f8f9fa;">
  <h2 style="text-align: center; font-size: 36px; margin-bottom: 50px;">Meet Our Team</h2>
  <div class="team-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto;">
    <div class="team-member" style="background: white; border-radius: 8px; overflow: hidden; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
      <div style="padding: 20px;">
        <h3 style="margin: 0 0 5px 0;">Team Member Name</h3>
        <p style="color: #667eea; margin: 0; font-weight: bold;">Position</p>
      </div>
    </div>
    <div class="team-member" style="background: white; border-radius: 8px; overflow: hidden; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
      <div style="padding: 20px;">
        <h3 style="margin: 0 0 5px 0;">Team Member Name</h3>
        <p style="color: #667eea; margin: 0; font-weight: bold;">Position</p>
      </div>
    </div>
  </div>
</section>
    `.trim(),
  },
  faq: {
    id: 'faq',
    name: 'FAQ Section',
    icon: '❓',
    category: 'sections',
    preview: 'Frequently asked questions',
    html: `
<section class="faq-section" style="padding: 80px 20px; background: white; max-width: 800px; margin: 0 auto;">
  <h2 style="text-align: center; font-size: 36px; margin-bottom: 50px;">Frequently Asked Questions</h2>
  <div class="faq-list" style="display: grid; gap: 20px;">
    <div class="faq-item" style="border: 1px solid #ddd; border-radius: 5px; padding: 20px;">
      <h4 style="margin: 0 0 10px 0; cursor: pointer;">What is included in the package?</h4>
      <p style="margin: 0; color: #666;">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
    <div class="faq-item" style="border: 1px solid #ddd; border-radius: 5px; padding: 20px;">
      <h4 style="margin: 0 0 10px 0; cursor: pointer;">How do I get started?</h4>
      <p style="margin: 0; color: #666;">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
    <div class="faq-item" style="border: 1px solid #ddd; border-radius: 5px; padding: 20px;">
      <h4 style="margin: 0 0 10px 0; cursor: pointer;">What is the refund policy?</h4>
      <p style="margin: 0; color: #666;">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  </div>
</section>
    `.trim(),
  },
};

export const COMPONENT_CATEGORIES = {
  sections: 'Sections',
  elements: 'Elements',
};

export function getComponentsByCategory(category: string) {
  return Object.values(HTML_COMPONENTS).filter(comp => comp.category === category);
}

export function getComponentById(id: string) {
  return Object.values(HTML_COMPONENTS).find(comp => comp.id === id);
}
