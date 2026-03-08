import { GoalPlanner } from '../components/GoalPlanner';
import { Goal } from '../types';

interface GoalsPageProps {
    goals: Goal[];
    onUpdateGoal: (goal: Goal) => void;
    onAddGoal: (goal: Goal) => Promise<void>;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({ goals, onUpdateGoal, onAddGoal }) => {
    return (
        <div>
            <GoalPlanner goals={goals} onUpdateGoal={onUpdateGoal} onAddGoal={onAddGoal} />
        </div>
    );
};
