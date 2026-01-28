import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Home as HomeIcon,
    Compass,
    Trophy,
    Download,
    Users,
    Play,
    ChevronRight,
    Code,
    Gamepad2,
    Terminal,
    Zap,
    Star,
    TrendingUp,
    Award,
    MessageCircle,
    Calendar
} from 'lucide-react';

const Home = () => {
    const [activeNav, setActiveNav] = useState('home');

    // Mock leaderboard data
    const leaderboardData = [
        { rank: 1, name: "CodeNinja", score: 15420, avatar: "CN", color: "from-yellow-400 to-orange-500" },
        { rank: 2, name: "DevMaster", score: 14850, avatar: "DM", color: "from-gray-300 to-gray-400" },
        { rank: 3, name: "BugHunter", score: 13990, avatar: "BH", color: "from-amber-600 to-amber-700" },
        { rank: 4, name: "LogicKing", score: 12750, avatar: "LK", color: "from-blue-400 to-blue-600" },
        { rank: 5, name: "SyntaxQueen", score: 11880, avatar: "SQ", color: "from-purple-400 to-purple-600" },
    ];

    // Mock community posts
    const communityPosts = [
        { user: "PlayerOne", time: "2h ago", content: "Just completed level 50! This game is amazing for learning loops 🔥", likes: 42 },
        { user: "CodeCrafter", time: "5h ago", content: "Anyone want to team up for the weekly challenge?", likes: 18 },
        { user: "DevStudent", time: "1d ago", content: "Finally understood recursion thanks to the dragon boss fight!", likes: 156 },
    ];

    const faqs = [
        {
            question: "What is CodeBound?",
            answer: "CodeBound is an immersive 2D puzzle-based educational game that teaches Java programming fundamentals through 100 progressively challenging levels. Learn coding by solving engaging puzzles and defeating bosses!"
        },
        {
            question: "Do I need prior programming experience?",
            answer: "Not at all! CodeBound is designed for absolute beginners. Our progressive difficulty system adapts to your learning pace, starting from basic concepts and gradually introducing advanced topics."
        },
        {
            question: "What programming languages does it teach?",
            answer: "Currently, CodeBound focuses on Java fundamentals including variables, loops, conditionals, functions, and object-oriented programming. We're planning to add support for Python and JavaScript soon!"
        },
        {
            question: "Is CodeBound free?",
            answer: "Yes! CodeBound is completely free for students and individual learners. We also offer enterprise and classroom licenses for educational institutions."
        },
        {
            question: "What platforms is CodeBound available on?",
            answer: "CodeBound is available on Windows, macOS, and Linux. You can download the desktop version or access the web version directly from your browser."
        }
    ];

    return (
        <div className="h-screen flex overflow-hidden bg-black text-white">
            {/* Left Sidebar */}
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col"
            >
                {/* Logo */}
                <div className="p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Code className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">CodeBound</h1>
                            <p className="text-xs text-zinc-500">Learn by Gaming</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {[
                        { id: 'home', icon: HomeIcon, label: 'Home' },
                        { id: 'browse', icon: Compass, label: 'Browse Levels' },
                        { id: 'explore', icon: Gamepad2, label: 'Explore' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveNav(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeNav === item.id
                                ? 'bg-gradient-to-r from-blue-500/20 to-orange-500/20 text-white border border-blue-500/30'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Suggested */}
                <div className="p-4 border-t border-zinc-800">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3">Suggested</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded hover:bg-zinc-800/50 cursor-pointer transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-xs font-bold">
                                CB
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">CodeBound Live</p>
                                <p className="text-xs text-zinc-500">6 watching</p>
                            </div>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="p-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-600">© 2026 CodeBound</p>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <ScrollArea className="h-full">
                    <div className="p-8 space-y-8">
                        {/* Game Trailer / Hero Video Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700">
                                {/* Video Placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200')] bg-cover bg-center opacity-20" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                                    {/* Play Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/80 transition-shadow"
                                    >
                                        <Play className="w-10 h-10 text-white ml-1" fill="white" />
                                    </motion.button>
                                </div>

                                {/* Video Info Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                                    <div className="flex items-end justify-between">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-red-500/90 hover:bg-red-500 text-white border-0">
                                                    🔴 LIVE
                                                </Badge>
                                                <span className="text-sm text-zinc-300">Just Chatting</span>
                                            </div>
                                            <h2 className="text-4xl font-bold">CodeBound Official Trailer</h2>
                                            <p className="text-zinc-300 max-w-2xl">
                                                Watch how thousands of developers started their coding journey through our immersive game-based learning platform. Master programming while having fun!
                                            </p>
                                            <div className="flex items-center gap-4 pt-2">
                                                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-0 shadow-lg shadow-blue-500/30">
                                                    <Play className="w-4 h-4 mr-2" />
                                                    Watch Trailer
                                                </Button>
                                                <Button size="lg" variant="outline" className="border-zinc-600 hover:bg-zinc-800">
                                                    Learn More
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-zinc-400">6,420 watching</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* Overview Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Featured Challenges</h2>
                                <button className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm font-medium">
                                    View all <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { title: "Beginner's Quest", level: "Levels 1-25", students: "15.2k", icon: Zap, gradient: "from-green-400 to-emerald-600" },
                                    { title: "Loop Master", level: "Levels 26-50", students: "8.7k", icon: Terminal, gradient: "from-blue-400 to-cyan-600" },
                                    { title: "Function Warrior", level: "Levels 51-75", students: "4.3k", icon: Code, gradient: "from-purple-400 to-pink-600" },
                                    { title: "OOP Legend", level: "Levels 76-100", students: "2.1k", icon: Award, gradient: "from-orange-400 to-red-600" },
                                ].map((challenge, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        whileHover={{ y: -5 }}
                                        className="relative group"
                                    >
                                        <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer overflow-hidden">
                                            <div className={`absolute inset-0 bg-gradient-to-br ${challenge.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                                            <CardHeader className="relative">
                                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${challenge.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                                                    <challenge.icon className="w-6 h-6 text-white" />
                                                </div>
                                                <CardTitle className="text-lg">{challenge.title}</CardTitle>
                                                <p className="text-sm text-zinc-500">{challenge.level}</p>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                    <Users className="w-4 h-4" />
                                                    <span>{challenge.students} students</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>

                        {/* Community Hub */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            id="community"
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Community Hub</h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {communityPosts.map((post, i) => (
                                    <Card key={i} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-sm font-bold">
                                                        {post.user[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{post.user}</p>
                                                        <p className="text-xs text-zinc-500">{post.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-zinc-300 mb-3">{post.content}</p>
                                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                                                <button className="flex items-center gap-1 hover:text-red-400 transition-colors">
                                                    <Star className="w-4 h-4" />
                                                    {post.likes}
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="text-center">
                                <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                                    <Users className="w-4 h-4 mr-2" />
                                    Join the Community
                                </Button>
                            </div>
                        </motion.section>

                        {/* FAQs Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            id="faq"
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>

                            <Accordion type="single" collapsible className="space-y-4">
                                {faqs.map((faq, i) => (
                                    <AccordionItem
                                        key={i}
                                        value={`item-${i}`}
                                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-6 data-[state=open]:border-blue-500/50"
                                    >
                                        <AccordionTrigger className="text-left hover:no-underline py-4">
                                            <span className="font-semibold">{faq.question}</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-zinc-400 pb-4">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </motion.section>

                        {/* Call to Action */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="relative rounded-2xl overflow-hidden"
                        >
                            <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 text-center">
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
                                <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                                    <h2 className="text-4xl font-bold">Ready to Start Your Coding Adventure?</h2>
                                    <p className="text-lg text-blue-100">
                                        Join thousands of developers who transformed their careers through CodeBound. Download now and start learning!
                                    </p>
                                    <Button size="lg" className="bg-white text-purple-600 hover:bg-zinc-100">
                                        <Download className="w-5 h-5 mr-2" />
                                        Download CodeBound
                                    </Button>
                                </div>
                            </div>
                        </motion.section>
                    </div>
                </ScrollArea>
            </main>

            {/* Right Sidebar - Leaderboard */}
            <motion.aside
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-80 bg-zinc-950 border-l border-zinc-800 flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Leaderboard</h2>
                        <Trophy className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-xs text-zinc-500">Be the first to top the leaderboard!</p>
                    <p className="text-xs text-zinc-600 mt-1">Stay tuned for new events and streams.</p>
                </div>

                {/* Leaderboard List */}
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                        {leaderboardData.map((player, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="group"
                            >
                                <div className={`relative p-4 rounded-lg border transition-all ${player.rank === 1
                                    ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        {/* Rank */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${player.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black' :
                                            player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                                                player.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                                                    'bg-zinc-800 text-zinc-400'
                                            }`}>
                                            {player.rank}
                                        </div>

                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${player.color} flex items-center justify-center text-sm font-bold shadow-lg`}>
                                            {player.avatar}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{player.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <TrendingUp className="w-3 h-3" />
                                                <span>{player.score.toLocaleString()} pts</span>
                                            </div>
                                        </div>

                                        {/* Rank Badge */}
                                        {player.rank <= 3 && (
                                            <Award className={`w-5 h-5 ${player.rank === 1 ? 'text-yellow-400' :
                                                player.rank === 2 ? 'text-gray-400' :
                                                    'text-amber-600'
                                                }`} />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Updates Section */}
                <div className="p-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <h3 className="text-sm font-semibold">Updates & News</h3>
                    </div>

                    <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-4 h-4 text-blue-400 mt-1" />
                                <div>
                                    <p className="text-xs font-medium">New Challenge Live!</p>
                                    <p className="text-xs text-zinc-500 mt-1">Weekly coding challenge starts now</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Download Button - Fixed Bottom Right */}
                <div className="p-4 border-t border-zinc-800">
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-0 shadow-lg shadow-blue-500/30">
                        <Download className="w-4 h-4 mr-2" />
                        Download Now
                    </Button>
                </div>
            </motion.aside>
        </div>
    );
};

export default Home;