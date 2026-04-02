import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useTopPlayers, useLeaderboardStats } from '@/db/queries/useLeaderboard';
import { useCommunityPosts, useCreatePost, useAddComment, useLikePost } from '@/db/queries/useCommunity';
import { useToken } from '@/hooks/useToken';
import { useIsMobile } from '@/hooks/use-mobile';
import { authApi } from '@/db/api/auth.api';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { removeAuthToken } from '@/utils/auth';
import {
    Home as HomeIcon,
    Trophy,
    Download,
    Sun,
    Moon,
    Users,
    Play,
    Code,
    Zap,
    Star,
    TrendingUp,
    Award,
    MessageCircle,
    Menu,
    X,
    Smartphone,
    LogOut
} from 'lucide-react';

import { Input } from '@/components/ui/input';

const Home = () => {
    const [activeNav, setActiveNav] = useState('home');
    const [showFloatingInstall, setShowFloatingInstall] = useState(true);
    const [activeFeature, setActiveFeature] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        if (typeof window === 'undefined') return true;
        const stored = window.localStorage.getItem('home-theme');
        if (stored === 'dark') return true;
        if (stored === 'light') return false;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const token = useToken();
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: currentUser } = useQuery({
        queryKey: ['auth', 'session', 'home'],
        queryFn: async () => {
            const response = await authApi.sessionToken();
            return response.data?.user;
        },
        enabled: Boolean(token),
        retry: false,
    });

    const firstName = currentUser?.username?.trim().split(/\s+/)[0] || 'Player';
    const userInitials = firstName.slice(0, 2).toUpperCase();
    const shortUserId = currentUser?.id ? currentUser.id.slice(0, 8) : null;

    // Community Post Data & State
    const [newPostContent, setNewPostContent] = useState('');
    const [replyingToPost, setReplyingToPost] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const createPostMutation = useCreatePost();
    const addCommentMutation = useAddComment();
    const likePostMutation = useLikePost();

    const handlePostSubmit = async () => {
        if (!token) return navigate({ to: '/auth/login' });
        if (!newPostContent.trim()) return;
        await createPostMutation.mutateAsync({ content: newPostContent });
        setNewPostContent('');
    };

    const handleReplySubmit = async (postId: string) => {
        if (!token) return navigate({ to: '/auth/login' });
        if (!replyContent.trim()) return;
        await addCommentMutation.mutateAsync({ postId, data: { content: replyContent } });
        setReplyContent('');
        setReplyingToPost(null);
    };

    const handleLike = (postId: string) => {
        if (!token) return navigate({ to: '/auth/login' });
        likePostMutation.mutate(postId);
    };

    const handleLogout = () => {
        removeAuthToken();
        queryClient.clear();
        toast.success('Logged out successfully.');
        navigate({ to: '/auth/login' });
    };

    // API data
    const { data: topPlayersData, isLoading: isLoadingLeaderboard } = useTopPlayers(8);
    const { data: leaderboardStatsData } = useLeaderboardStats();
    const { data: communityPostsData, isLoading: isLoadingPosts } = useCommunityPosts(3);

    const leaderboardData = topPlayersData || [];
    const communityPosts = communityPostsData?.posts || [];
    const totalPlayers = leaderboardStatsData?.totalPlayers || 0;
    const downloadLink = 'https://drive.google.com/uc?export=download&id=1-Bs623hKY-IZpwsFATqaN3K31qUmValc';

    const pageThemeClass = isDarkMode ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-900';
    const panelThemeClass = isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200';
    const cardThemeClass = isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200';
    const inputThemeClass = isDarkMode
        ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-400'
        : 'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-500';
    const outlineButtonThemeClass = isDarkMode
        ? 'border-zinc-700 text-zinc-200 hover:bg-zinc-800 bg-transparent'
        : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100 bg-white';

    useEffect(() => {
        const timer = setTimeout(() => {
            toast.success('Install CodeBound app for a better experience!', {
                duration: 5000,
                icon: '✓',
            });
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        window.localStorage.setItem('home-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const handleDownload = () => {
        window.location.href = downloadLink;
    };

    const toggleTheme = () => setIsDarkMode((prev) => !prev);

    const handleDismissFloating = () => setShowFloatingInstall(false);

    // Helper function to get avatar initials
    const getAvatarInitials = (username: string) => {
        return username.slice(0, 2).toUpperCase();
    };

    // Helper function to get avatar color
    const getAvatarColor = (index: number) => {
        const colors = [
            "from-yellow-400 to-orange-500",
            "from-gray-300 to-gray-400",
            "from-amber-600 to-amber-700",
            "from-blue-400 to-blue-600",
            "from-purple-400 to-purple-600",
            "from-cyan-400 to-blue-500",
            "from-green-400 to-emerald-600",
            "from-orange-400 to-red-600",
        ];
        return colors[index % colors.length];
    };

    // Helper function to format time ago
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            return `${diffInDays}d ago`;
        }
    };

    // Game phases shown as interactive feature cards
    const systemFeatures = [
        {
            id: 'phase-1',
            title: 'Variables, Input, and Basic Math',
            focus: 'Core foundations',
            levelRange: '1 - 30',
            icon: Zap,
            gradient: 'from-green-400 to-emerald-600',
            detail: 'Foundation phase for syntax familiarity, basic data handling, and console interaction.'
        },
        {
            id: 'phase-2',
            title: 'Iteration (Loops) and Switching',
            focus: 'Control flow',
            levelRange: '31 - 50',
            icon: Code,
            gradient: 'from-blue-400 to-cyan-600',
            detail: 'Focuses on decision-making using if/else and branching logic for problem solving.'
        },
        {
            id: 'phase-3',
            title: 'Arrays and String Processing',
            focus: 'Data handling',
            levelRange: '51 - 70',
            icon: TrendingUp,
            gradient: 'from-purple-400 to-pink-600',
            detail: 'Builds repetition patterns with loop structures and deeper algorithmic thinking.'
        },
        {
            id: 'phase-4',
            title: 'Procedural Programming & Logic Methods',
            focus: 'Methods and structure',
            levelRange: '71 - 100',
            icon: Award,
            gradient: 'from-orange-400 to-red-600',
            detail: 'Covers structured data and reusable methods to prepare for advanced coding challenges.'
        },
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
            answer: "Yes! CodeBound is completely free for individual learners. We also offer enterprise and classroom licenses for educational institutions."
        },
        {
            question: "What platforms is CodeBound available on?",
            answer: "CodeBound is available on Windows, macOS, and Linux. You can download the desktop version or access the web version directly from your browser."
        }
    ];

    return (
        <div className={`min-h-screen lg:h-screen lg:flex lg:overflow-hidden ${pageThemeClass}`}>
            {/* Left Sidebar */}
            {!isMobile && (
                <motion.aside
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`w-64 border-r lg:flex lg:flex-col ${panelThemeClass}`}
                >
                    {/* Logo */}
                    <div className="p-6 border-b border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Code className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg tracking-tight">CodeBound</h1>
                                <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Learn by Gaming</p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleTheme}
                            className={`mt-3 w-full ${outlineButtonThemeClass}`}
                        >
                            {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </Button>

                        {token && (
                            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
                                <div className="flex items-center gap-3">
                                    {currentUser?.avatar ? (
                                        <img
                                            src={currentUser.avatar}
                                            alt={firstName}
                                            className="h-9 w-9 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs font-bold flex items-center justify-center">
                                            {userInitials}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{firstName}</p>
                                        <p className={`text-[11px] truncate ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>{shortUserId ? `ID: ${shortUserId}` : 'ID: -'}</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    size="sm"
                                    className={`mt-3 w-full ${outlineButtonThemeClass}`}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Navigation - Home only */}
                    <nav className="p-4 space-y-2">
                        <button
                            onClick={() => setActiveNav('home')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeNav === 'home'
                                ? isDarkMode
                                    ? 'bg-gradient-to-r from-cyan-500/15 to-blue-600/15 text-white border border-transparent'
                                    : 'bg-gradient-to-r from-cyan-100 to-blue-100 text-zinc-900 border border-cyan-200'
                                : isDarkMode
                                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent'
                                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent'
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
                        <div className={`border-t pt-4 ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
                            <p className={`text-xs ${isDarkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>© 2026 CodeBound</p>
                        </div>
                    </div>
                </motion.aside>
            )}

            {/* Main Content */}
            <main className="w-full overflow-y-auto scrollbar-hidden lg:flex-1">
                <ScrollArea className="h-full scrollbar-hidden">
                    <div className="p-8 space-y-8">
                        {/* Mobile Header */}
                        {isMobile && (
                            <div className={`rounded-2xl border p-4 ${isDarkMode ? 'border-zinc-800 bg-zinc-950/80' : 'border-zinc-200 bg-white'}`}>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                            <Code className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="font-bold text-lg tracking-tight">CodeBound</h1>
                                            <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Learn by Gaming</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleDownload}
                                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>

                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className={outlineButtonThemeClass}
                                                aria-label="Open user menu"
                                            >
                                                <Menu className="h-5 w-5" />
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="right" className={isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'}>
                                            <SheetHeader>
                                                <SheetTitle className={isDarkMode ? 'text-white' : 'text-zinc-900'}>Account</SheetTitle>
                                            </SheetHeader>

                                            <div className="px-4 pt-2 pb-4">
                                                <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-zinc-800 bg-zinc-900/80' : 'border-zinc-200 bg-zinc-50'}`}>
                                                    <div className="flex items-center gap-3">
                                                        {currentUser?.avatar ? (
                                                            <img
                                                                src={currentUser.avatar}
                                                                alt={firstName}
                                                                className="h-11 w-11 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs font-bold flex items-center justify-center">
                                                                {userInitials}
                                                            </div>
                                                        )}

                                                        <div className="min-w-0">
                                                            <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{firstName}</p>
                                                            <p className={`text-xs truncate ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{shortUserId ? `ID: ${shortUserId}` : 'ID: -'}</p>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        onClick={handleLogout}
                                                        variant="outline"
                                                        className={`mt-4 w-full ${outlineButtonThemeClass}`}
                                                    >
                                                        <LogOut className="w-4 h-4 mr-2" />
                                                        Logout
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="px-4 pb-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={toggleTheme}
                                                    className={`w-full ${outlineButtonThemeClass}`}
                                                >
                                                    {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                                                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                                                </Button>
                                            </div>
                                        </SheetContent>
                                    </Sheet>
                                </div>
                            </div>
                        )}

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

                        {/* Mobile Leaderboard - appears right after trailer */}
                        {isMobile && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="space-y-4"
                            >
                                <Card className="bg-zinc-900/95 border-zinc-700 shadow-lg shadow-black/30">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xl text-zinc-100">Leaderboard</CardTitle>
                                            <Trophy className="w-5 h-5 text-yellow-500" />
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>{totalPlayers.toLocaleString()} players worldwide</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3.5">
                                        {isLoadingLeaderboard ? (
                                            Array(4).fill(0).map((_, i) => (
                                                <div key={i} className="p-3.5 rounded-lg bg-zinc-950 animate-pulse">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-zinc-800" />
                                                        <div className="w-9 h-9 rounded-full bg-zinc-800" />
                                                        <div className="flex-1 space-y-2">
                                                            <div className="h-3 bg-zinc-800 rounded w-24" />
                                                            <div className="h-3 bg-zinc-800 rounded w-32" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            leaderboardData.slice(0, 5).map((player, i) => (
                                                <div
                                                    key={player.userId}
                                                    className={`relative p-3.5 rounded-lg border ${player.rank === 1
                                                        ? 'border-yellow-500/20 bg-gradient-to-br from-yellow-500/15 to-orange-500/12'
                                                        : 'border-zinc-800 bg-zinc-950'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${player.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-amber-900' :
                                                            player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-700' :
                                                                player.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-950' :
                                                                    'bg-zinc-800 text-zinc-400'
                                                            }`}>
                                                            <Trophy className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(i)} flex items-center justify-center text-xs font-bold shadow-lg`}>
                                                            {getAvatarInitials(player.username)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-sm text-zinc-100 break-words">{player.username}</p>
                                                            <p className="text-[13px] leading-snug text-zinc-300 break-words">
                                                                <span className="font-medium text-zinc-200">Lvl {player.levelReached}</span>
                                                                <span className="text-zinc-400"> • {player.tokensEarned.toLocaleString()} tokens</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}

                                    </CardContent>
                                </Card>
                            </motion.section>
                        )}

                        {/* Overview Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">System Features</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {systemFeatures.map((feature, i) => (
                                    <motion.div
                                        key={feature.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        whileHover={{ y: -5 }}
                                        className="relative group"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setActiveFeature((prev) => (prev === feature.id ? null : feature.id))}
                                            className="w-full text-left"
                                        >
                                            <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer overflow-hidden">
                                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                                                <CardHeader className="relative">
                                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                                                        <feature.icon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <CardTitle className="text-lg text-zinc-100">{feature.title}</CardTitle>
                                                    <p className="text-sm text-zinc-300">{feature.focus}</p>
                                                </CardHeader>
                                                <CardContent className="relative space-y-3">
                                                    <p className="text-sm text-zinc-400">Levels {feature.levelRange}</p>
                                                    <AnimatePresence initial={false}>
                                                        {activeFeature === feature.id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <p className="text-xs text-cyan-300/90 border-t border-zinc-800 pt-3">
                                                                    {feature.detail}
                                                                </p>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </CardContent>
                                            </Card>
                                        </button>
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
                            <Card className={cardThemeClass}>
                                <CardContent className="pt-6">
                                    {token ? (
                                        <div className="space-y-4">
                                            <Textarea
                                                placeholder="What's on your mind? Share your code or ask a question..."
                                                value={newPostContent}
                                                onChange={(e) => setNewPostContent(e.target.value)}
                                                className={`${inputThemeClass} resize-none focus-visible:ring-cyan-500`}
                                            />
                                            <div className="flex justify-end">
                                                <Button onClick={handlePostSubmit} disabled={!newPostContent.trim() || createPostMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                                                    {createPostMutation.isPending ? 'Posting...' : 'Post'}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-zinc-400 mb-4">You must be logged in to post in the community.</p>
                                            <Button onClick={() => navigate({ to: '/auth/login' })} variant="outline" className={isDarkMode ? 'border-cyan-500/60 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 hover:text-cyan-200 bg-transparent' : 'border-cyan-400 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-500 hover:text-cyan-900 bg-white'}>
                                                <Users className="w-4 h-4 mr-2" />
                                                Login to Join the Community
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {isLoadingPosts ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <Card key={i} className="bg-zinc-900 border-transparent">
                                            <CardHeader>
                                                <div className="flex items-center gap-3 animate-pulse">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-800" />
                                                    <div className="space-y-2 flex-1">
                                                        <div className="h-4 bg-zinc-800 rounded w-24" />
                                                        <div className="h-3 bg-zinc-800 rounded w-16" />
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="animate-pulse">
                                                <div className="space-y-2">
                                                    <div className="h-3 bg-zinc-800 rounded" />
                                                    <div className="h-3 bg-zinc-800 rounded w-3/4" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : communityPosts.length > 0 ? (
                                    communityPosts.map((post) => (
                                        <Card key={post.id} className="bg-zinc-900 border-transparent hover:border-transparent transition-colors">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-sm font-bold">
                                                            {getAvatarInitials(post.user.username)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-sm text-zinc-100">{post.user.username}</p>
                                                            <p className="text-xs text-zinc-400">{formatTimeAgo(post.created_at)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-zinc-100 mb-3 leading-relaxed">{post.content}</p>
                                                <div className="flex items-center gap-4 text-xs text-zinc-300">
                                                    <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                                                        <Star className="w-4 h-4" />
                                                        <span>{post.likes}</span>
                                                    </button>
                                                    <button onClick={() => setReplyingToPost(replyingToPost === post.id ? null : post.id)} className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                                                        <MessageCircle className="w-4 h-4" />
                                                        <span>{post._count?.comments || 0}</span>
                                                    </button>
                                                </div>

                                                {post.comments && post.comments.length > 0 && (
                                                    <div className="mt-4 space-y-2 border-t border-zinc-800/80 pt-3">
                                                        {post.comments.map((comment) => (
                                                            <div key={comment.id} className="rounded-md bg-zinc-950/80 border border-zinc-800 px-3 py-2">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 text-[10px] font-bold text-white flex items-center justify-center">
                                                                        {getAvatarInitials(comment.user.username)}
                                                                    </div>
                                                                    <p className="text-xs font-medium text-zinc-100">{comment.user.username}</p>
                                                                    <p className="text-[11px] text-zinc-400">{formatTimeAgo(comment.created_at)}</p>
                                                                </div>
                                                                <p className="text-xs text-zinc-100 leading-relaxed">{comment.content}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {replyingToPost === post.id && (
                                                    <div className="mt-4 flex flex-col gap-2">
                                                        <div className="flex gap-2">
                                                            <Input
                                                                placeholder="Write a reply..."
                                                                value={replyContent}
                                                                onChange={(e) => setReplyContent(e.target.value)}
                                                                className={`${inputThemeClass} text-sm h-9 focus-visible:ring-cyan-500`}
                                                            />
                                                            <Button size="sm" onClick={() => handleReplySubmit(post.id)} disabled={!replyContent.trim() || addCommentMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700 text-white h-9">
                                                                {addCommentMutation.isPending ? '...' : 'Reply'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <Card className="bg-zinc-900 border-transparent col-span-3">
                                        <CardContent className="py-12 text-center">
                                            <MessageCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                                            <p className="text-zinc-500">No community posts yet. Be the first to share!</p>
                                        </CardContent>
                                    </Card>
                                )}
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
            {!isMobile && (
                <motion.aside
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`w-80 border-l lg:flex lg:flex-col ${panelThemeClass}`}
                >
                    {/* Header */}
                    <div className={`p-6 border-b ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Leaderboard</h2>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleTheme}
                                    className={outlineButtonThemeClass}
                                >
                                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                </Button>
                                <Trophy className="w-5 h-5 text-yellow-500" />
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>
                            <Users className="w-3 h-3" />
                            <span>{totalPlayers.toLocaleString()} players worldwide</span>
                        </div>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>Updated every 5 minutes</p>
                    </div>

                    {/* Leaderboard List */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-3">
                            {isLoadingLeaderboard ? (
                                Array(8).fill(0).map((_, i) => (
                                    <div key={i} className="p-4 rounded-lg bg-zinc-900 animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-800" />
                                            <div className="w-10 h-10 rounded-full bg-zinc-800" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-zinc-800 rounded w-24" />
                                                <div className="h-3 bg-zinc-800 rounded w-32" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                leaderboardData.map((player, i) => (
                                    <motion.div
                                        key={player.userId}
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
                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(i)} flex items-center justify-center text-sm font-bold shadow-lg`}>
                                                    {getAvatarInitials(player.username)}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm truncate">{player.username}</p>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                        <TrendingUp className="w-3 h-3" />
                                                        <span>Lvl {player.levelReached} • {player.tokensEarned.toLocaleString()} tokens</span>
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
                                ))
                            )}
                        </div>
                    </ScrollArea>

                </motion.aside>
            )}

        </div>
    );
};

export default Home;