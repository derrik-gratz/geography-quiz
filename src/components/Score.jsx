import React from 'react';

function Score({ correct, incorrect }) {
  return (
    <div className="score">
      Score: {correct} / {incorrect}
    </div>
  );
}

export default Score; 