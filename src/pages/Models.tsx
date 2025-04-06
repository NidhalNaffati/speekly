import {useState, useEffect} from 'react';
import data from '../data/models-list.json';
import {ModelItem} from "../types/ModelItem";
import {Languages} from 'lucide-react';
import ModelsTable from '../components/ModelsTable';
import {Navbar} from "@/components/Navbar.tsx";

interface LanguageGroup {
  language: string;
  models: ModelItem[];
}

const Models = () => {
  const [groupedModels, setGroupedModels] = useState<LanguageGroup[]>([]);

  useEffect(() => {
    // Group models by language
    const isLanguageHeader = (item: ModelItem): boolean => {
      return item.Size === "" && item['Word error rate/Speed'] === "" && item.Notes === "" && item.License === "";
    };

    const groups = data.reduce<LanguageGroup[]>((acc, item) => {
      if (isLanguageHeader(item)) {
        return [...acc, {language: item.Model, models: []}];
      }

      const lastGroup = acc[acc.length - 1];
      return [
        ...acc.slice(0, -1),
        {...lastGroup, models: [...lastGroup.models, item]}
      ];
    }, [{language: '', models: []}]).filter(group => group.language !== '');

    setGroupedModels(groups);
  }, []);

  return (
    <>
      <Navbar />
      <div className="container max-w-6xl mx-auto px-4 pt-20">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Languages className="w-5 h-5 text-primary"/>
            </div>
            <h1 className="text-3xl font-bold gradient-text">Transcription Models</h1>
          </div>
          <p className="text-muted-foreground">
            Download language models to enable offline transcription capabilities
          </p>
        </div>

        <div className="space-y-8">
          {groupedModels.map((group, gIndex) => (
            <ModelsTable
              key={gIndex}
              language={group.language}
              models={group.models}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Models;
