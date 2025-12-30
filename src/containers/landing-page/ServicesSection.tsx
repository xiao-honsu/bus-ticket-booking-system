'use client';

import { CreditCard, Shield, Headphones } from 'lucide-react';

const services = [
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Integrate secure payment gateways for users to pay for their tickets',
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-700',
  },
  {
    icon: Shield,
    title: 'Refund Policy',
    description: 'Offer options for the users to purchase refundable tickets with clear terms',
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-700',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Get assistance anytime through chat, email, or phone',
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-700',
  },
];

export default function ServicesSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Our <span className="text-red-600">Services</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className={`${service.bgColor} rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${service.bgColor} p-4 rounded-xl border border-gray-300`}>
                    <Icon className={`w-6 h-6 ${service.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
