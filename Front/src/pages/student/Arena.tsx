import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Swords, Users, Zap, Crown, Medal, Award } from 'lucide-react';
import { useStore } from '@/store/useStore';

const Arena = () => {
  const user = useStore((state) => state.user);

  const leaderboard = [
    { position: 1, name: 'Emma Watson', xp: 5420, level: 24, rank: 'Platinum', avatar: 'EW' },
    { position: 2, name: 'John Smith', xp: 4890, level: 22, rank: 'Gold', avatar: 'JS' },
    { position: 3, name: 'Sarah Lee', xp: 4320, level: 21, rank: 'Gold', avatar: 'SL' },
    { position: 4, name: 'Mike Chen', xp: 3850, level: 19, rank: 'Silver', avatar: 'MC' },
    { position: 5, name: 'Alex Johnson', xp: user?.xp || 2450, level: user?.level || 12, rank: user?.rank || 'Gold', avatar: 'AJ', isCurrentUser: true },
    { position: 6, name: 'Lisa Park', xp: 2120, level: 11, rank: 'Silver', avatar: 'LP' },
    { position: 7, name: 'Tom Wilson', xp: 1890, level: 10, rank: 'Bronze', avatar: 'TW' },
  ];

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Platinum': return 'text-secondary';
      case 'Gold': return 'text-warning';
      case 'Silver': return 'text-muted-foreground';
      case 'Bronze': return 'text-orange-500';
      default: return 'text-foreground';
    }
  };

  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown className="w-6 h-6 text-warning" />;
    if (position === 2) return <Medal className="w-6 h-6 text-muted-foreground" />;
    if (position === 3) return <Award className="w-6 h-6 text-orange-500" />;
    return null;
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gradient">Battle Arena</h1>
        <p className="text-muted-foreground text-lg">
          Compete with peers and rise through the ranks
        </p>
      </div>

      {/* Battle Modes */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 hover:scale-105 transition-transform cursor-pointer glow-primary h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Swords className="w-7 h-7 text-primary" />
                1v1 Quiz Battle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Challenge a friend to a head-to-head quiz showdown. First to answer correctly wins!
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-warning" />
                <span className="text-warning font-medium">+200 XP for winner</span>
              </div>
              <Button size="lg" className="w-full glow-primary">
                Find Opponent
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30 hover:scale-105 transition-transform cursor-pointer glow-accent h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="w-7 h-7 text-secondary" />
                2v2 Team Battle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Team up with a partner and compete against another duo. Teamwork makes the dream work!
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-warning" />
                <span className="text-warning font-medium">+150 XP per team member</span>
              </div>
              <Button size="lg" variant="outline" className="w-full hover:bg-secondary/10">
                Create Team
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="w-7 h-7 text-warning" />
              Global Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaderboard.map((player, index) => (
              <motion.div
                key={player.position}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  player.isCurrentUser
                    ? 'bg-primary/10 border-2 border-primary glow-primary'
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="w-12 flex items-center justify-center">
                  {getRankIcon(player.position) || (
                    <div className="text-2xl font-bold text-muted-foreground">
                      #{player.position}
                    </div>
                  )}
                </div>

                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                  {player.avatar}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{player.name}</p>
                    {player.isCurrentUser && (
                      <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>Level {player.level}</span>
                    <span className={`font-medium ${getRankColor(player.rank)}`}>
                      {player.rank}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-primary font-bold text-lg">
                    <Zap className="w-5 h-5" />
                    {player.xp.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Rank Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-warning/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-warning" />
              Your Rank Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-warning">{user?.rank}</p>
                <p className="text-sm text-muted-foreground">Current Rank</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-secondary">Platinum</p>
                <p className="text-sm text-muted-foreground">Next Rank</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to Platinum</span>
                <span className="font-medium">{user?.xp || 0} / 5000 XP</span>
              </div>
              <Progress value={((user?.xp || 0) / 5000) * 100} className="h-3" />
            </div>
            <p className="text-sm text-muted-foreground">
              You need <span className="text-primary font-medium">{5000 - (user?.xp || 0)} XP</span> more to reach Platinum rank!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Arena;
