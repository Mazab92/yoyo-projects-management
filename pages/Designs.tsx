// Fix: Replaced placeholder content with a functional Designs page and integrated Gemini API for image generation.
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Project, Design } from '../types';
import { mockDesigns } from '../data/mockData';
import EmptyState from '../components/EmptyState';
import { Loader2 } from 'lucide-react';

interface DesignsProps {
  project: Project | null;
}

const Designs: React.FC<DesignsProps> = ({ project }) => {
  const [designs, setDesigns] = useState<Design[]>(mockDesigns);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
        setError("Please enter a prompt.");
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });
        
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

        const newDesign: Design = {
            id: `design-${Date.now()}`,
            name: prompt,
            imageUrl: imageUrl,
            uploadedAt: new Date().toISOString(),
        };
        setDesigns(prevDesigns => [newDesign, ...prevDesigns]);
        setPrompt('');

    } catch (err) {
        console.error(err);
        setError("Failed to generate design. Please check your API key and try again.");
    } finally {
        setIsLoading(false);
    }
  };

  if (!project) {
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
            <EmptyState title="No Project Selected" message="Please select a project to manage designs." />
        </main>
    );
  }

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Designs for {project.name}</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage and generate design assets for your project.</p>

      <div className="p-4 my-6 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generate New Design with AI</h2>
        <form onSubmit={handleGenerateDesign} className="mt-4 space-y-4">
          <div>
            <label htmlFor="design-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prompt</label>
            <div className="flex mt-1 space-x-2">
                <input
                  type="text"
                  id="design-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A robot holding a red skateboard."
                  className="flex-grow block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !prompt}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary-light disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        'Generate'
                    )}
                </button>
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </form>
      </div>
      
      {designs.length === 0 && !isLoading ? (
        <EmptyState title="No Designs Yet" message="Generate your first design using the form above." />
      ) : (
        <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {designs.map(design => (
            <div key={design.id} className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-dark-secondary">
              <img src={design.imageUrl} alt={design.name} className="object-cover w-full h-48" />
              <div className="p-4">
                <p className="font-semibold text-gray-900 truncate dark:text-white" title={design.name}>{design.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Generated: {new Date(design.uploadedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Designs;
