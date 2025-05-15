import {format} from 'date-fns';
import {Script} from '@/components/ScriptTable';
import {Clock, Calendar, Edit2, Save, History} from 'lucide-react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';

interface ScriptDetailsProps {
    script: Script;
    isEditing: boolean;
}

export function ScriptDetails({script, isEditing}: ScriptDetailsProps) {
    // Calculate reading time
    const calculateReadingTime = (wordCount: number) => {
        const wordsPerMinute = 200; // Average reading speed
        return Math.ceil(wordCount / wordsPerMinute);
    };

    return (
        <Card className="mb-4">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle>{script.title}</CardTitle>
                    <Badge variant={isEditing ? "secondary" : "outline"}>
                        {isEditing ? (
                            <Edit2 className="h-3 w-3 mr-1"/>
                        ) : (
                            <History className="h-3 w-3 mr-1"/>
                        )}
                        {isEditing ? 'Editing' : 'Viewing'}
                    </Badge>
                </div>
                <CardDescription>
                    {isEditing ? 'You are currently editing this script' : 'View-only mode'}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1"/>
                        Created: {format(script.createdAt, 'MMM d, yyyy')}
                    </div>

                    <div className="flex items-center">
                        <Save className="h-4 w-4 mr-1"/>
                        Updated: {format(script.updatedAt, 'MMM d, yyyy h:mm a')}
                    </div>

                    <Separator orientation="vertical" className="h-4"/>

                    <div className="flex items-center">
                        <Badge variant="outline" className="font-normal">
                            {script.wordCount} words
                        </Badge>
                    </div>

                    <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1"/>
                        ~{calculateReadingTime(script.wordCount)} min read
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-0 text-xs text-muted-foreground">
                {isEditing
                    ? "Changes won't be saved until you click the Save button below"
                    : "To edit this script, click the Edit button in the scripts list"}
            </CardFooter>
        </Card>
    );
}