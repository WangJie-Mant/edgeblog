export interface TutorialStep {
    id: string;
    title: string;
    subtitle?: string;
    content: string;
    contentHtml?: string;
    image?: string;
    imageAlt?: string;
}

export interface Tutorial {
    key: string;
    version: number;
    steps: TutorialStep[];
}

export interface TutorialStatus {
    completed: boolean;
    completedVersion?: number | null;
}
