import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Code, Gamepad2, Globe, Shield, Zap } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen flex flex-col bg-background font-sans text-foreground overflow-x-hidden">
            {/* Navigation */}
            <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                            C
                        </div>
                        <span className="font-bold text-xl tracking-tight">CodeBound</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <a href="#features" className="hover:text-primary transition-colors">Features</a>
                        <a href="#about" className="hover:text-primary transition-colors">About</a>
                        <a href="#community" className="hover:text-primary transition-colors">Community</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link to="/auth/login">
                            <Button variant="ghost" size="sm" className="hidden sm:flex">
                                Login
                            </Button>
                        </Link>
                        <Link to="/auth/register">
                            <Button size="sm" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute top-40 right-20 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
                </div>

                <div className="container relative z-10 px-4 mx-auto text-center space-y-8">
                    <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <span className="mr-2">✨</span> The Future of Coding Education
                    </Badge>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                        Master Programming <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">
                            Through Gameplay
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        Dive into an immersive world where code controls reality. Solve puzzles, defeat bosses, and build your legacy—all while learning real-world programming skills.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <Link to="/dashboard">
                            <Button size="lg" className="h-12 px-8 text-base shadow-xl shadow-primary/25 hover:scale-105 transition-transform duration-300">
                                Start Your Journey
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-background/50 hover:bg-muted/50 backdrop-blur-sm">
                            View Demo
                        </Button>
                    </div>

                    {/* Stats or Trust Indicators */}
                    <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-forwards">
                        {[
                            { label: "Active Players", value: "10k+" },
                            { label: "Challenges Solved", value: "500k+" },
                            { label: "Languages Supported", value: "4+" },
                            { label: "Community Rating", value: "4.9/5" },
                        ].map((stat, i) => (
                            <div key={i} className="space-y-1">
                                <h3 className="text-2xl md:text-3xl font-bold">{stat.value}</h3>
                                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 bg-muted/30">
                <div className="container px-4 mx-auto space-y-16">
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold">Why CodeBound?</h2>
                        <p className="text-muted-foreground text-lg">
                            We bridge the gap between abstract concepts and tangible results through an engaging RPG experience.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Gamepad2,
                                title: "Immersive Gameplay",
                                desc: "Forget boring tutorials. Learn loops, logic, and algorithms by casting spells and hacking terminals in a 3D world."
                            },
                            {
                                icon: Globe,
                                title: "Real-World Skills",
                                desc: "From Python to JavaScript, the syntax you write in-game is the code you'll use in professional development."
                            },
                            {
                                icon: Shield,
                                title: "Interactive Challenges",
                                desc: "Test your skills against dynamic puzzles that adapt to your learning pace and provide instant feedback."
                            }
                        ].map((feature, i) => (
                            <Card key={i} className="border-0 shadow-lg shadow-black/5 bg-card/50 backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300">
                                <CardHeader className="space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle>{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">
                                        {feature.desc}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5"></div>
                <div className="container px-4 mx-auto relative z-10">
                    <div className="bg-gradient-to-br from-background to-muted border border-white/50 dark:border-white/10 p-12 md:p-16 rounded-3xl shadow-2xl text-center space-y-8 max-w-5xl mx-auto backdrop-blur-xl">
                        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-4">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold">Ready to Start Coding?</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Join thousands of developers who started their journey with CodeBound.
                            No prior experience required—just curiosity.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/auth/register">
                                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 shadow-xl shadow-primary/20">
                                    Create Free Account
                                </Button>
                            </Link>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Free forever for students. No credit card required.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-muted/20 py-12">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2 md:col-span-1 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="size-6 rounded bg-primary flex items-center justify-center text-white text-xs font-bold">C</div>
                                <span className="font-bold">CodeBound</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Empowering the next generation of developers through play.
                            </p>
                        </div>

                        {/* Links groups */}
                        {[
                            { title: "Product", links: ["Features", "Pricing", "Enterprise", "Roadmap"] },
                            { title: "Resources", links: ["Documentation", "API", "Community", "Blog"] },
                            { title: "Company", links: ["About", "Careers", "Contact", "Privacy"] }
                        ].map((group, i) => (
                            <div key={i} className="space-y-4">
                                <h4 className="font-semibold">{group.title}</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    {group.links.map((link) => (
                                        <li key={link}><a href="#" className="hover:text-primary transition-colors">{link}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-8 text-center text-sm text-muted-foreground">
                        © 2024 CodeBound. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;