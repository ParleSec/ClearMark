import { useState, useEffect } from 'react';
import { Node } from 'slate';
import { EditorState } from '../types/editor';
import { READING_SPEED } from '../utils/constants';

interface WordCountResult {
  wordCount: number;
  characterCount: number;
  readingTime: number;
  paragraphCount: number;
}

/**
 * Custom hook to calculate word count and related statistics
 * @param editorState The current editor state
 * @returns Object with word count statistics
 */
export function useWordCount(editorState: EditorState): WordCountResult {
  const [stats, setStats] = useState<WordCountResult>({
    wordCount: 0,
    characterCount: 0,
    readingTime: 0,
    paragraphCount: 0,
  });

  useEffect(() => {
    // Extract text from all nodes
    const text = editorState
      .map(n => Node.string(n))
      .join('\n');
    
    // Count paragraphs (non-empty nodes)
    const paragraphCount = editorState.filter(node => 
      Node.string(node).trim().length > 0
    ).length;
    
    // Count words
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    
    // Count characters (excluding whitespace)
    const characterCount = text.replace(/\s/g, '').length;
    
    // Calculate reading time (words / average reading speed, min 1 minute)
    const readingTime = Math.max(1, Math.ceil(wordCount / READING_SPEED));
    
    setStats({
      wordCount,
      characterCount,
      readingTime,
      paragraphCount,
    });
  }, [editorState]);

  return stats;
}

/**
 * Calculate word count from plain text string
 * @param text Plain text to analyze
 * @returns Word count statistics
 */
export function calculateWordCount(text: string): WordCountResult {
  // Count paragraphs
  const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length;
  
  // Count words
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  
  // Count characters (excluding whitespace)
  const characterCount = text.replace(/\s/g, '').length;
  
  // Calculate reading time
  const readingTime = Math.max(1, Math.ceil(wordCount / READING_SPEED));
  
  return {
    wordCount,
    characterCount,
    readingTime,
    paragraphCount,
  };
}