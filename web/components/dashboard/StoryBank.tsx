"use client";

import { useState } from "react";
import { InterviewPlanArtifact } from "@/lib/types/case";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";

interface StoryBankProps {
    artifact: InterviewPlanArtifact;
    onUpdate: (newArtifact: InterviewPlanArtifact) => void;
}

export function StoryBank({ artifact, onUpdate }: StoryBankProps) {
    const [isEditing, setIsEditing] = useState(false);

    // Mock handler for adding a story (in real app, this opens a dialog)
    const handleAddStory = () => {
        const newStory = {
            id: Date.now().toString(),
            headline: "New Story",
            situation: "Situation...",
            task: "Task...",
            action: "Action...",
            result: "Result...",
            tags: ["execution"] as any
        };
        onUpdate({
            ...artifact,
            story_bank: [...artifact.story_bank, newStory]
        });
    };

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="font-serif text-2xl font-medium text-foreground">Story Bank</h2>
                    <p className="text-muted-foreground text-sm">Your ammo for the behavioral interview.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddStory}>
                    <Plus className="w-4 h-4 mr-2" /> Add STAR Story
                </Button>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                {artifact.story_bank.map((story) => (
                    <Card key={story.id} className="border-border bg-card group hover:border-indigo-500/30 transition-all">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <h3 className="font-medium text-foreground">{story.headline}</h3>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-6 w-6"><Edit2 className="w-3 h-3" /></Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                                </div>
                            </div>

                            <div className="bg-secondary/20 rounded p-3 text-xs space-y-2">
                                <div className="grid grid-cols-[60px_1fr] gap-2">
                                    <span className="font-bold text-muted-foreground uppercase opacity-70">S/T</span>
                                    <span className="text-muted-foreground">{story.situation}</span>
                                </div>
                                <div className="grid grid-cols-[60px_1fr] gap-2">
                                    <span className="font-bold text-indigo-600 uppercase opacity-70">Action</span>
                                    <span className="text-foreground">{story.action}</span>
                                </div>
                                <div className="grid grid-cols-[60px_1fr] gap-2">
                                    <span className="font-bold text-emerald-600 uppercase opacity-70">Result</span>
                                    <span className="text-foreground">{story.result}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {story.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-[10px] font-mono lowercase text-muted-foreground">
                                        <Tag className="w-3 h-3 mr-1 opacity-50" />
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {artifact.story_bank.length === 0 && (
                    <div className="col-span-2 border-2 border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
                        <p>No stories yet. Add your first STAR story to start practicing.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
