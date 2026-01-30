import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Home as HomeIcon,
    Trophy,
    Download,
    Users,
    Play,
    ChevronRight,
    Code,
    Terminal,
    Zap,
    Star,
    TrendingUp,
    Award,
    MessageCircle,
    Calendar,
    X,
    Smartphone
} from 'lucide-react';

const Home = () => {
    const [activeNav, setActiveNav] = useState('home');
    const [downloadCount, setDownloadCount] = useState(1532);
    const [totalPlayers] = useState(5230);
    const [showFloatingInstall, setShowFloatingInstall] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            toast.success('Install CodeBound app for a better experience!', {
                duration: 5000,
                icon: '✓',
            });
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Mock leaderboard data (matching backend schema)
    const leaderboardData = [
        { rank: 1, username: "JavaNinja", highestLevel: 100, totalTokens: 5000, achievementsCount: 45, avatar: "JN", color: "from-yellow-400 to-orange-500" },
        { rank: 2, username: "CodeMaster", highestLevel: 98, totalTokens: 4800, achievementsCount: 42, avatar: "CM", color: "from-gray-300 to-gray-400" },
        { rank: 3, username: "LogicQueen", highestLevel: 95, totalTokens: 4500, achievementsCount: 40, avatar: "LQ", color: "from-amber-600 to-amber-700" },
        { rank: 4, username: "DebugKing", highestLevel: 92, totalTokens: 4200, achievementsCount: 38, avatar: "DK", color: "from-blue-400 to-blue-600" },
        { rank: 5, username: "SyntaxWizard", highestLevel: 90, totalTokens: 4000, achievementsCount: 35, avatar: "SW", color: "from-purple-400 to-purple-600" },
        { rank: 6, username: "LoopMaster", highestLevel: 87, totalTokens: 3850, achievementsCount: 33, avatar: "LM", color: "from-cyan-400 to-blue-500" },
        { rank: 7, username: "ArrayExplorer", highestLevel: 85, totalTokens: 3700, achievementsCount: 31, avatar: "AE", color: "from-green-400 to-emerald-600" },
        { rank: 8, username: "FunctionFox", highestLevel: 82, totalTokens: 3500, achievementsCount: 29, avatar: "FF", color: "from-orange-400 to-red-600" },
    ];

    // Mock community posts (matching backend schema)
    const communityPosts = [
        { 
            id: "post_1",
            username: "JavaLearner", 
            time: "2h ago", 
            content: "Just completed Level 50! This game is amazing for learning loops 🔥", 
            likes: 42,
            commentCount: 5,
            avatar: "JL" 
        },
        { 
            id: "post_2",
            username: "CodeNinja", 
            time: "5h ago", 
            content: "Any tips for Level 75? Stuck on the recursion puzzle 🤔", 
            likes: 18,
            commentCount: 12,
            avatar: "CN" 
        },
        { 
            id: "post_3",
            username: "DevStudent", 
            time: "1d ago", 
            content: "Finally understood OOP thanks to the dragon boss fight! Best learning experience ever! 🐉", 
            likes: 156,
            commentCount: 23,
            avatar: "DS" 
        },
    ];

    const handleDownload = () => {
        setDownloadCount(prev => prev + 1);
        toast.success('Download started! Check your device.');
        // TODO: Replace with actual API call
        // incrementDownload();
    };

    const handleDismissFloating = () => setShowFloatingInstall(false);

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

                {/* Navigation - Home only */}
                <nav className="p-4 space-y-2">
                    <button
                        onClick={() => setActiveNav('home')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeNav === 'home'
                            ? 'bg-gradient-to-r from-cyan-500/15 to-blue-600/15 text-white border border-transparent'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent'
                            }`}
                    >
                        <HomeIcon className="w-5 h-5" />
                        <span className="font-medium text-sm">Home</span>
                    </button>
                </nav>

                {/* Install App - sidebar CTA */}
                <div className="flex-1 flex flex-col justify-end p-4">
                    <AnimatePresence>
                        {showFloatingInstall && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{
                                    opacity: 1,
                                    y: [0, -6, 0],
                                }}
                                transition={{
                                    opacity: { duration: 0.3 },
                                    y: {
                                        duration: 1.2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    },
                                }}
                                exit={{ opacity: 0, y: -8 }}
                                className="mb-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-transparent p-4 shadow-lg"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-lg bg-cyan-500/20 p-2">
                                            <Smartphone className="h-5 w-5 text-cyan-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-white">Install App</p>
                                            <p className="text-xs text-zinc-400 mt-0.5">Play CodeBound on your device</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDismissFloating}
                                        className="rounded p-1 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors shrink-0"
                                        aria-label="Dismiss"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md hover:from-cyan-400 hover:to-blue-500 transition-all"
                                >
                                    <Download className="h-4 w-4" />
                                    Download
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="border-t border-zinc-800 pt-4">
                        <p className="text-xs text-zinc-600">© 2026 CodeBound</p>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto scrollbar-hidden">
                <ScrollArea className="h-full scrollbar-hidden">
                    <div className="p-8 space-y-8">
                        {/* Game Trailer / Hero Video Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-transparent">
                                {/* Video Placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200')] bg-cover bg-center opacity-25" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                    {/* Play Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/80 transition-shadow ring-4 ring-white/20"
                                    >
                                        <Play className="w-10 h-10 text-white ml-1" fill="white" />
                                    </motion.button>
                                </div>

                                {/* Video Info Overlay - no LIVE, no watching count */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                                    <div className="flex items-end justify-between">
                                        <div className="space-y-3 max-w-2xl">
                                            <h2 className="text-4xl font-bold text-white drop-shadow-sm">CodeBound Official Trailer</h2>
                                            <p className="text-zinc-300 text-lg">
                                                Watch how thousands of developers started their coding journey through our immersive game-based learning platform. Master programming while having fun!
                                            </p>
                                            <div className="flex items-center gap-4 pt-2">
                                                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-0 shadow-lg shadow-blue-500/30 text-white">
                                                    <Play className="w-4 h-4 mr-2" />
                                                    Watch Trailer
                                                </Button>
                                                <Button size="lg" variant="outline" className="border-cyan-400 text-cyan-300 hover:bg-cyan-500/25 hover:border-cyan-300 hover:text-white bg-white/5">
                                                    Learn More
                                                </Button>
                                            </div>
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
                                        <Card className="bg-zinc-900 border-transparent hover:border-transparent transition-all cursor-pointer overflow-hidden">
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
                                {communityPosts.map((post) => (
                                    <Card key={post.id} className="bg-zinc-900 border-transparent hover:border-transparent transition-colors">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-sm font-bold">
                                                        {post.avatar}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{post.username}</p>
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
                                                    <span>{post.likes}</span>
                                                </button>
                                                <button className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                                                    <MessageCircle className="w-4 h-4" />
                                                    <span>{post.commentCount}</span>
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="text-center">
                                <Button variant="outline" className="border-cyan-500/60 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 hover:text-cyan-200 bg-transparent">
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
                                        className="bg-zinc-900 border border-transparent rounded-lg px-6 data-[state=open]:border-transparent"
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
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <Users className="w-3 h-3" />
                                <span>{totalPlayers.toLocaleString()} players worldwide</span>
                            </div>
                            <p className="text-xs text-zinc-600 mt-1">Updated every 5 minutes</p>
                        </div>

                {/* Leaderboard List */}
                <ScrollArea className="flex-1 p-4 scrollbar-hidden">
                    <div className="space-y-3">
                        {leaderboardData.map((player, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="group"
                            >
                                <div className={`relative p-4 rounded-lg border border-transparent transition-all ${player.rank === 1
                                    ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10'
                                    : 'bg-zinc-900 hover:bg-zinc-800/80'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        {/* Rank - trophy icon: gold, silver, bronze, classic */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${player.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-amber-900' :
                                            player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-700' :
                                                player.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-950' :
                                                    'bg-zinc-800 text-zinc-500'
                                            }`}>
                                            <Trophy className="w-4 h-4" />
                                        </div>

                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${player.color} flex items-center justify-center text-sm font-bold shadow-lg`}>
                                            {player.avatar}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{player.username}</p>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <TrendingUp className="w-3 h-3" />
                                                <span>Lvl {player.highestLevel} • {player.totalTokens.toLocaleString()} tokens</span>
                                            </div>
                                        </div>

                                        {/* Rank Badge - trophy for top 3 */}
                                        {player.rank <= 3 && (
                                            <Trophy className={`w-5 h-5 ${player.rank === 1 ? 'text-yellow-400' :
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

                {/* Download count below leaderboard */}
                <div className="p-4 border-t border-zinc-800 text-center">
                    <p className="text-xs text-zinc-500">Downloaded</p>
                    <p className="text-2xl font-bold text-cyan-400">{downloadCount.toLocaleString()}</p>
                    <p className="text-xs text-zinc-600">times</p>
                </div>
            </motion.aside>

        </div>
    );
};

export default Home;