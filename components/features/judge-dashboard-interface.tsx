'use client';

import { useState } from 'react';
import { Save, Eye, Lock, Unlock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ScoreInput {
  contestantId: string;
  name: string;
  category: string;
  presentationScore: number;
  talentScore: number;
  answersScore: number;
  totalScore?: number;
}

interface JudgeDashboardProps {
  scores: ScoreInput[];
  categoryWeights?: { presentation: number; talent: number; answers: number };
  onScoresChange?: (scores: ScoreInput[]) => void;
  onSubmit?: (scores: ScoreInput[]) => Promise<void>;
  isSubmitting?: boolean;
}

export function JudgeDashboardInterface({
  scores: initialScores,
  categoryWeights = { presentation: 0.3, talent: 0.4, answers: 0.3 },
  onScoresChange,
  onSubmit,
  isSubmitting = false,
}: JudgeDashboardProps) {
  const [scores, setScores] = useState(initialScores);
  const [lockedScores, setLockedScores] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);

  const handleScoreChange = (contestantId: string, field: keyof Omit<ScoreInput, 'contestantId' | 'name' | 'category' | 'totalScore'>, value: number) => {
    if (lockedScores.has(contestantId)) return;

    const updatedScores = scores.map((score) => {
      if (score.contestantId === contestantId) {
        const updated = { ...score, [field]: Math.min(100, Math.max(0, value)) };
        const total =
          updated.presentationScore * categoryWeights.presentation +
          updated.talentScore * categoryWeights.talent +
          updated.answersScore * categoryWeights.answers;
        return { ...updated, totalScore: Math.round(total * 100) / 100 };
      }
      return score;
    });

    setScores(updatedScores);
    onScoresChange?.(updatedScores);
  };

  const toggleLock = (contestantId: string) => {
    const newLocked = new Set(lockedScores);
    if (newLocked.has(contestantId)) {
      newLocked.delete(contestantId);
    } else {
      newLocked.add(contestantId);
    }
    setLockedScores(newLocked);
  };

  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit(scores);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Judge Scoring Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">Enter scores for each contestant across different categories</p>
      </div>

      {/* Weights Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Scoring Weights</h3>
            <p className="text-sm text-blue-700 mt-1">
              Presentation: {(categoryWeights.presentation * 100).toFixed(0)}% | Talent: {(categoryWeights.talent * 100).toFixed(0)}% | Answers:{' '}
              {(categoryWeights.answers * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button variant={showPreview ? 'default' : 'outline'} onClick={() => setShowPreview(!showPreview)}>
          <Eye className="w-4 h-4 mr-2" />
          {showPreview ? 'Edit Mode' : 'Preview'}
        </Button>
      </div>

      {/* Scoring Grid */}
      <div className="space-y-4">
        {scores.map((score) => {
          const isLocked = lockedScores.has(score.contestantId);

          return (
            <div key={score.contestantId} className={cn('border rounded-lg p-6', isLocked && 'bg-gray-50 opacity-70')}>
              {/* Contestant Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{score.name}</h3>
                  <p className="text-sm text-gray-600">{score.category}</p>
                </div>
                <button
                  onClick={() => toggleLock(score.contestantId)}
                  disabled={isSubmitting}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    isLocked ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                </button>
              </div>

              {/* Score Inputs */}
              <div className="space-y-4">
                {/* Presentation Score */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Presentation Score (0-100) - {(categoryWeights.presentation * 100).toFixed(0)}% weight
                  </label>
                  {showPreview ? (
                    <div className="px-4 py-2 bg-gray-50 rounded-lg">{score.presentationScore}</div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={score.presentationScore}
                        onChange={(e) =>
                          handleScoreChange(score.contestantId, 'presentationScore', parseInt(e.target.value))
                        }
                        disabled={isLocked || isSubmitting}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={score.presentationScore}
                        onChange={(e) =>
                          handleScoreChange(score.contestantId, 'presentationScore', parseInt(e.target.value))
                        }
                        disabled={isLocked || isSubmitting}
                        className="w-16 px-3 py-2 border rounded-lg text-center"
                      />
                    </div>
                  )}
                </div>

                {/* Talent Score */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Talent Score (0-100) - {(categoryWeights.talent * 100).toFixed(0)}% weight
                  </label>
                  {showPreview ? (
                    <div className="px-4 py-2 bg-gray-50 rounded-lg">{score.talentScore}</div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={score.talentScore}
                        onChange={(e) =>
                          handleScoreChange(score.contestantId, 'talentScore', parseInt(e.target.value))
                        }
                        disabled={isLocked || isSubmitting}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={score.talentScore}
                        onChange={(e) =>
                          handleScoreChange(score.contestantId, 'talentScore', parseInt(e.target.value))
                        }
                        disabled={isLocked || isSubmitting}
                        className="w-16 px-3 py-2 border rounded-lg text-center"
                      />
                    </div>
                  )}
                </div>

                {/* Answers Score */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Answers Score (0-100) - {(categoryWeights.answers * 100).toFixed(0)}% weight
                  </label>
                  {showPreview ? (
                    <div className="px-4 py-2 bg-gray-50 rounded-lg">{score.answersScore}</div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={score.answersScore}
                        onChange={(e) =>
                          handleScoreChange(score.contestantId, 'answersScore', parseInt(e.target.value))
                        }
                        disabled={isLocked || isSubmitting}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={score.answersScore}
                        onChange={(e) =>
                          handleScoreChange(score.contestantId, 'answersScore', parseInt(e.target.value))
                        }
                        disabled={isLocked || isSubmitting}
                        className="w-16 px-3 py-2 border rounded-lg text-center"
                      />
                    </div>
                  )}
                </div>

                {/* Total Score */}
                <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                  <span className="font-semibold text-blue-900">Total Score</span>
                  <span className="text-2xl font-bold text-blue-600">{score.totalScore?.toFixed(2) || 0}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!showPreview && (
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || lockedScores.size === 0}
          className="w-full"
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Submitting Scores...' : 'Submit Scores'}
        </Button>
      )}
    </div>
  );
}
