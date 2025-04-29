import { useState } from 'react';
import { LightningBoltIcon, DocumentTextIcon, CogIcon, ChartBarIcon, AcademicCapIcon, CheckCircleIcon } from '@heroicons/react/outline';
import { useNavigate } from 'react-router-dom';
export default function HomePage() {
    const navigate = useNavigate();
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        {
            title: "Quick MCQ Generation",
            description: "Generate multiple-choice questions instantly from any text content or topic name.",
            icon: <LightningBoltIcon className="w-8 h-8 text-blue-500" />
        },
        {
            title: "Customizable Output",
            description: "Specify the number of questions you need and get perfectly formatted MCQs.",
            icon: <CogIcon className="w-8 h-8 text-green-500" />
        },
        {
            title: "Comprehensive Testing",
            description: "Test your knowledge with the generated questions and get immediate feedback.",
            icon: <CheckCircleIcon className="w-8 h-8 text-purple-500" />
        },
        {
            title: "Learning Analytics",
            description: "Track your progress and identify areas that need more focus.",
            icon: <ChartBarIcon className="w-8 h-8 text-yellow-500" />
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
                            <span className="ml-2 text-xl font-bold text-gray-800">MCQ Generator</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* <button className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                Login
              </button> */}
                            <button className="px-4 py-2 text-sm font-medium  border-solid border-2 border-indigo-600 rounded-md text-white bg-indigo-600  hover:text-indigo-600  hover:bg-white "  onClick={() => navigate('/innovativeForm')}>
                                Get Started
                            </button>










                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Generate MCQs in Seconds
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                        Transform any text or topic into multiple-choice questions for effective learning and assessment.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <div className="inline-flex rounded-md shadow">
                            <button className="px-4 py-2 text-sm font-medium  border-solid border-2 border-indigo-600 rounded-md text-white bg-indigo-600  hover:text-indigo-600  hover:bg-white inline-flex items-center justify-center" onClick={() => navigate('/innovativeForm')}>
                                Try It Now 
                                <svg className="-mr-1 ml-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v7.586l2.293-2.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 11.586V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <div className="ml-3 inline-flex">
                            <button className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="bg-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            A better way to create study materials
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`p-6 rounded-lg cursor-pointer transition-all duration-300 ${activeFeature === index ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50 hover:bg-gray-100'}`}
                                    onClick={() => setActiveFeature(index)}
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            {feature.icon}
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-base text-gray-500">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Demo Section */}
            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center mb-10">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">How It Works</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Simple as 1-2-3
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center ">
                        <div className="md:w-1/2 p-6 ">
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-2">
                                        <span className="text-white font-bold">1</span>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Enter your content</h3>
                                        <p className="mt-1 text-gray-500">
                                            Paste any paragraph or enter a topic name you want to generate questions about.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-2">
                                        <span className="text-white font-bold">2</span>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Set your preferences</h3>
                                        <p className="mt-1 text-gray-500">
                                            Choose how many questions you need and customize difficulty if needed.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-2">
                                        <span className="text-white font-bold">3</span>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Get your MCQs</h3>
                                        <p className="mt-1 text-gray-500">
                                            Receive perfectly formatted multiple-choice questions ready for studying or testing.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <div className="md:w-1/2 p-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Enter your text or topic
                  </label>
                  <textarea
                    id="content"
                    rows="4"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Paste your paragraph here or enter a topic name (e.g., 'Photosynthesis')"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700">
                    Number of questions
                  </label>
                  <select
                    id="questionCount"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option>5</option>
                    <option>10</option>
                    <option>15</option>
                    <option>20</option>
                  </select>
                </div>
                <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                  Generate MCQs
                </button>
              </div>
            </div> */}
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center mb-10">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">What Students Say</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Trusted by learners worldwide
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {[
                            {
                                quote: "This tool saved me hours of creating practice questions for my exams. Highly recommended!",
                                name: "Sarah Johnson",
                                role: "Medical Student"
                            },
                            {
                                quote: "As a teacher, I use this to quickly generate quizzes for my students. It's incredibly efficient.",
                                name: "Michael Chen",
                                role: "High School Teacher"
                            },
                            {
                                quote: "Perfect for last-minute test preparation. The questions are relevant and challenging.",
                                name: "David Wilson",
                                role: "Engineering Student"
                            }
                        ].map((testimonial, index) => (
                            <div key={index} className="bg-gray-50 p-6 rounded-lg">
                                <DocumentTextIcon className="h-8 w-8 text-indigo-500" />
                                <p className="mt-4 text-gray-600 italic">"{testimonial.quote}"</p>
                                <div className="mt-4">
                                    <p className="font-medium text-gray-900">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-indigo-700">
                <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        <span className="block">Ready to boost your learning?</span>
                        <span className="block">Start generating MCQs today.</span>
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-indigo-200">
                        Join thousands of students and educators who use our tool to create effective study materials.
                    </p>
                    <button className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto" onClick={() => navigate('/innovativeForm')}>
                        Get Started for Free
                        <svg className="-mr-1 ml-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">      
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v7.586l2.293-2.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 11.586V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
                            <ul className="mt-4 space-y-4">
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">Features</a></li>
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">Pricing</a></li>
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">API</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
                            <ul className="mt-4 space-y-4">
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">Documentation</a></li>
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">Guides</a></li>
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
                            <ul className="mt-4 space-y-4">
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">About</a></li>
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">Careers</a></li>
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                            <ul className="mt-4 space-y-4">
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacy</a></li>
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">Terms</a></li>
                                <li><a href="#" className="text-base text-gray-300 hover:text-white">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
                        <div className="flex space-x-6 md:order-2">
                            {/* Social media links would go here */}
                        </div>
                        <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
                            &copy; 2023 MCQ Generator. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}