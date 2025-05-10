import {useState} from 'react';
import {format} from 'date-fns';
import {Edit2, Eye, Trash2, Filter} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';

export interface Script {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    wordCount: number;
}

interface ScriptTableProps {
    scripts: Script[];
    onEditScript: (script: Script) => void;
    onDeleteScript: (scriptId: string) => void;
    onViewScript: (script: Script) => void;
}

export function ScriptTable({scripts, onEditScript, onDeleteScript, onViewScript}: ScriptTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'updatedAt' | 'wordCount'>('updatedAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSort = (column: 'title' | 'createdAt' | 'updatedAt' | 'wordCount') => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('desc');
        }
    };

    const filteredScripts = scripts
        .filter(script => script.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'title') {
                return sortDirection === 'asc'
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            } else if (sortBy === 'wordCount') {
                return sortDirection === 'asc'
                    ? a.wordCount - b.wordCount
                    : b.wordCount - a.wordCount;
            } else {
                const dateA = sortBy === 'createdAt' ? a.createdAt : a.updatedAt;
                const dateB = sortBy === 'createdAt' ? b.createdAt : b.updatedAt;
                return sortDirection === 'asc'
                    ? dateA.getTime() - dateB.getTime()
                    : dateB.getTime() - dateA.getTime();
            }
        });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Scripts</h2>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search scripts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSort('title')}>
                                Sort by Title {sortBy === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSort('createdAt')}>
                                Sort by Created Date {sortBy === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSort('updatedAt')}>
                                Sort by Updated Date {sortBy === 'updatedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSort('wordCount')}>
                                Sort by Word Count {sortBy === 'wordCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Word Count</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredScripts.length > 0 ? (
                            filteredScripts.map((script) => (
                                <TableRow key={script.id}>
                                    <TableCell className="font-medium">{script.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{script.wordCount} words</Badge>
                                    </TableCell>
                                    <TableCell>{format(script.createdAt, 'MMM d, yyyy')}</TableCell>
                                    <TableCell>{format(script.updatedAt, 'MMM d, yyyy h:mm a')}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onViewScript(script)}
                                                className="h-8 w-8"
                                            >
                                                <Eye className="h-4 w-4"/>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEditScript(script)}
                                                className="h-8 w-8"
                                            >
                                                <Edit2 className="h-4 w-4"/>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDeleteScript(script.id)}
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    No scripts found. Create a new script to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}