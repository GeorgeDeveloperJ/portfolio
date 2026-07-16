import { Skill } from "../hooks/useApi";

export function getSkillCategories(skills: Skill[]): string[] {
    return Array.from(new Set(skills.map(s => s.category)));
}
