import React, { useState } from 'react';

function ExportModal({ isOpen, onClose, guesses, currentPromptType }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate markdown content
  const generateMarkdown = () => {
    let markdown = '# Geography Quiz Results\n\n';
    
    // Group guesses by country
    const countryGroups = {};
    guesses.forEach(guess => {
      if (!countryGroups[guess.country]) {
        countryGroups[guess.country] = {
          name: guess.country,
          code: guess.countryCode,
          nameAttempts: [],
          flagAttempts: [],
          mapAttempts: []
        };
      }
      
      // Add attempt to appropriate category
      if (guess.promptType === 'text') {
        countryGroups[guess.country].nameAttempts.push(guess.correct);
      } else if (guess.promptType === 'flag') {
        countryGroups[guess.country].flagAttempts.push(guess.correct);
      } else if (guess.promptType === 'map') {
        countryGroups[guess.country].mapAttempts.push(guess.correct);
      }
    });

    // Create table header
    markdown += '| Country | Name | Flag | Map |\n';
    markdown += '|---------|------|------|-----|\n';

    // Add rows for each country
    Object.keys(countryGroups).forEach(countryName => {
      const country = countryGroups[countryName];
      
      const nameCell = getStatusDisplay(country.nameAttempts, 'text', countryName);
      const flagCell = getStatusDisplay(country.flagAttempts, 'flag', countryName);
      const mapCell = getStatusDisplay(country.mapAttempts, 'map', countryName);
      
      markdown += `| ${countryName} | ${nameCell} | ${flagCell} | ${mapCell} |\n`;
    });

    // Add summary
    const correctGuesses = guesses.filter(g => g.correct === true).length;
    const incorrectGuesses = guesses.filter(g => g.correct === false).length;
    const totalGuesses = correctGuesses + incorrectGuesses;
    
    markdown += '\n## Summary\n\n';
    markdown += `- **Total Guesses**: ${totalGuesses}\n`;
    markdown += `- **Correct**: ${correctGuesses}\n`;
    markdown += `- **Incorrect**: ${incorrectGuesses}\n`;
    if (totalGuesses > 0) {
      const accuracy = ((correctGuesses / totalGuesses) * 100).toFixed(1);
      markdown += `- **Accuracy**: ${accuracy}%\n`;
    }

    return markdown;
  };

  // Helper function to get status symbol and count (matching GuessTable logic)
  const getStatusDisplay = (attempts, promptType, countryName) => {
    if (attempts.length === 0) {
      // Check if this specific country had this field provided
      const hasProvidedField = guesses.some(guess => 
        guess.country === countryName && 
        guess.promptType === promptType && 
        guess.correct === null
      );
      if (hasProvidedField) {
        return '📋'; // Provided field indicator (no count)
      }
      return '⚪/0'; // No attempts
    }
    
    // Check if any attempt is null (provided field)
    const hasProvidedField = attempts.some(attempt => attempt === null);
    if (hasProvidedField) {
      return '📋'; // Provided field indicator (no count)
    }
    
    const lastAttempt = attempts[attempts.length - 1];
    const emoji = lastAttempt ? '✅' : '❌'; // Success or failure
    return `${emoji}/${attempts.length}`;
  };

  const handleCopyToClipboard = async () => {
    try {
      const markdown = generateMarkdown();
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generateMarkdown();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const markdown = generateMarkdown();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        color: '#000',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}>
          <h2 style={{ margin: 0, color: '#000' }}>Export Results</h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0.5rem 0.75rem',
              color: '#000',
              fontWeight: 'bold',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f0f0f0';
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{
          marginBottom: '1rem',
        }}>
          <button
            onClick={handleCopyToClipboard}
            style={{
              backgroundColor: copied ? '#4CAF50' : '#646cff',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
        
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '60vh',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          border: '1px solid #ddd',
          color: '#000',
        }}>
          {markdown}
        </pre>
      </div>
    </div>
  );
}

export default ExportModal; 