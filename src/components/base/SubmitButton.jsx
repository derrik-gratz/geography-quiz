import './SubmitButton.css';

export function SubmitButton({ handleSubmit, status }) {
  const isDisabled =
    status === 'completed' || status === 'incorrect' || status === 'disabled';
  const buttonText =
    (status === status) === 'completed'
      ? 'Correct!'
      : status === 'incorrect'
        ? 'Incorrect!'
        : 'Submit';
  return (
    <button
      className={`submit-button ${status ? `submit-button--${status}` : ''}`}
      onClick={handleSubmit}
      disabled={isDisabled}
    >
      {buttonText}
    </button>
  );
}

// style={{
//     border: guesses?.status === 'completed' ? '1px solid var(--input-option-correct)' :
//             isWrong ? '1px solid var(--input-option-incorrect)' :
//             `1px solid ${selectedCountry && !disabled ? 'var(--submit-button-ready)' : 'var(--submit-button-not-ready)'}`,
//     backgroundColor: guesses?.status === 'completed' ? 'var(--input-option-correct)' :
//                     isWrong ? 'var(--input-option-incorrect)' :
//                     (selectedCountry && !disabled ? 'var(--submit-button-ready)' : 'var(--submit-button-not-ready)'),
//     color: guesses?.status === 'completed' || isWrong ? '#fff' :
//             (selectedCountry && !disabled ? '#fff' : 'var(--text-primary)'),
//     cursor: (selectedCountry && componentStatus === 'active') ? 'pointer' : 'not-allowed',
//     whiteSpace: 'nowrap'
//     }}
