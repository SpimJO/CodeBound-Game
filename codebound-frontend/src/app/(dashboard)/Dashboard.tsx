import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useProgress, usePlayerStats, useLevelCompletions } from '@/db/queries/useProgress';
import { usePlayerRank } from '@/db/queries/useLeaderboard';
import {
    Trophy,
    Target,
    Clock,
    Zap,
    TrendingUp,
    Award,
    CheckCircle2,
    ChevronRight,
    PlayCircle,
    Flame,
} from 'lucide-react';

const Dashboard = () => {
    // Fetch data
    const { data: progressData, isLoading: isLoadingProgress } = useProgress();
    const { data: statsData, isLoading: isLoadingStats } = usePlayerStats();
    const { data: levelCompletionsData, isLoading: isLoadingLevels } = useLevelCompletions(10);
    const { data: rankData } = usePlayerRank();

    const progress = progressData || null;
    const stats = statsData || null;
    const levelCompletions = levelCompletionsData || [];
    const playerRank = rankData?.rank || null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const calculateProgressPercentage = () => {
        if (!progress) return 0;
        return Math.round((progress.currentLevel / 100) * 100);
    };

    if (isLoadingProgress || isLoadingStats) {
        return (
            <div className="h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mx-auto" />
                    <p className="text-zinc-400">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-zinc-800 bg-zinc-950">
                <div className="container mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                                Dashboard
                            </h1>
                            <p className="text-zinc-500 mt-1">Track your coding journey</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-zinc-500">Global Rank</p>
                                <p className="text-2xl font-bold text-cyan-400">#{playerRank || '--'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ScrollArea className="h-[calc(100vh-120px)]">
                <div className="container mx-auto px-8 py-8 space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="bg-zinc-900 border-transparent">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium text-zinc-400">Current Level</CardTitle>
                                        <Target className="w-5 h-5 text-cyan-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{progress?.currentLevel || 1}</div>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Highest: Level {progress?.highestLevel || 1}
                                    </p>
                                    <Progress value={calculateProgressPercentage()} className="mt-3" />
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="bg-zinc-900 border-transparent">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium text-zinc-400">Total Tokens</CardTitle>
                                        <Zap className="w-5 h-5 text-yellow-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{progress?.totalTokens?.toLocaleString() || 0}</div>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Earned tokens
                                    </p>
                                    <div className="mt-3 flex items-center gap-2 text-sm text-green-400">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>Active player</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="bg-zinc-900 border-transparent">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium text-zinc-400">Last active</CardTitle>
                                        <Clock className="w-5 h-5 text-purple-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold">
                                        {progress?.lastPlayed ? formatDate(progress.lastPlayed) : '—'}
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Last time you played
                                    </p>
                                    <div className="mt-3 flex items-center gap-2 text-sm text-purple-400">
                                        <Flame className="w-4 h-4" />
                                        <span>Keep it up!</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="bg-zinc-900 border-transparent">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium text-zinc-400">Achievements</CardTitle>
                                        <Trophy className="w-5 h-5 text-orange-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{progress?.achievementsCount || 0}</div>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Unlocked achievements
                                    </p>
                                    <div className="mt-3 flex items-center gap-2 text-sm text-orange-400">
                                        <Award className="w-4 h-4" />
                                        <span>Collector</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Tabs Section */}
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="bg-zinc-900 border-zinc-800">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="levels">Recent Levels</TabsTrigger>
                            <TabsTrigger value="stats">Detailed Stats</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Progress Overview */}
                                <Card className="bg-zinc-900 border-transparent">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <PlayCircle className="w-5 h-5 text-cyan-400" />
                                            Learning Progress
                                        </CardTitle>
                                        <CardDescription>Your journey through CodeBound</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-zinc-400">Levels Completed</span>
                                                <span className="font-semibold">{stats?.totalLevelsCompleted || 0} / 100</span>
                                            </div>
                                            <Progress value={(stats?.totalLevelsCompleted || 0)} />
                                        </div>

                                        <Separator className="bg-zinc-800" />

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-zinc-400">Last Played</span>
                                                <span className="font-semibold">
                                                    {progress?.lastPlayed ? formatDate(progress.lastPlayed) : 'Never'}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Quick Stats */}
                                <Card className="bg-zinc-900 border-transparent">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                                            Performance Metrics
                                        </CardTitle>
                                        <CardDescription>Your coding skills overview</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                        <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">Completion Rate</p>
                                                        <p className="text-xs text-zinc-500">Levels finished</p>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-0">
                                                    {stats?.totalLevelsCompleted || 0}%
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                                        <Trophy className="w-5 h-5 text-orange-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">Current Level</p>
                                                        <p className="text-xs text-zinc-500">Learning stage</p>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-0">
                                                    Level {progress?.currentLevel || 1}
                                                </Badge>
                                            </div>
                                        </div>

                                        <Separator className="bg-zinc-800" />

                                        <Button variant="outline" className="w-full border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10">
                                            <PlayCircle className="w-4 h-4 mr-2" />
                                            Continue Learning
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Recent Levels Tab */}
                        <TabsContent value="levels">
                            <Card className="bg-zinc-900 border-transparent">
                                <CardHeader>
                                    <CardTitle>Recent Level Completions</CardTitle>
                                    <CardDescription>Your latest achievements</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingLevels ? (
                                        <div className="space-y-3">
                                            {Array(5).fill(0).map((_, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/50 animate-pulse">
                                                    <div className="w-12 h-12 rounded-lg bg-zinc-700" />
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-4 bg-zinc-700 rounded w-32" />
                                                        <div className="h-3 bg-zinc-700 rounded w-48" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : levelCompletions.length > 0 ? (
                                        <div className="space-y-3">
                                            {levelCompletions.map((level, index) => (
                                                <motion.div
                                                    key={level.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                                                >
                                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600">
                                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold">Level {level.levelNumber}</p>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                                                            <span className="flex items-center gap-1">
                                                                <Zap className="w-3 h-3" />
                                                                +{level.tokensEarned} tokens
                                                            </span>
                                                            <span>Attempts: {level.attemptsCount}</span>
                                                            <span>{formatDate(level.completedAt)}</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-zinc-600" />
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Target className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                                            <p className="text-zinc-500">No levels completed yet</p>
                                            <p className="text-sm text-zinc-600 mt-1">Start your coding journey now!</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Detailed Stats Tab */}
                        <TabsContent value="stats">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="bg-zinc-900 border-transparent">
                                    <CardHeader>
                                        <CardTitle>All-Time Statistics</CardTitle>
                                        <CardDescription>Your complete coding journey</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-lg bg-zinc-800/50">
                                                <p className="text-sm text-zinc-500">Total Levels</p>
                                                <p className="text-2xl font-bold mt-1">{stats?.totalLevelsCompleted || 0}</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-zinc-800/50">
                                                <p className="text-sm text-zinc-500">Tokens Earned</p>
                                                <p className="text-2xl font-bold mt-1">{stats?.tokensEarned?.toLocaleString() || 0}</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-zinc-800/50">
                                                <p className="text-sm text-zinc-500">Highest Level</p>
                                                <p className="text-2xl font-bold mt-1">{stats?.highestLevel ?? 1}</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-zinc-800/50">
                                                <p className="text-sm text-zinc-500">Achievements</p>
                                                <p className="text-2xl font-bold mt-1">{stats?.achievementsUnlocked || 0}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-zinc-900 border-transparent">
                                    <CardHeader>
                                        <CardTitle>Activity</CardTitle>
                                        <CardDescription>Recent milestones</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                                <span className="text-sm text-zinc-400">Highest Level</span>
                                                <span className="font-bold text-orange-400">Level {stats?.highestLevel || 1}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                                <span className="text-sm text-zinc-400">Last Played</span>
                                                <span className="font-bold text-cyan-400">
                                                    {stats?.lastPlayed ? formatDate(stats.lastPlayed) : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </ScrollArea>
        </div>
    );
};

export default Dashboard;