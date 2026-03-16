// import { useCollapsible } from '../../hooks/useCollapsible.js';
import './CollapsibleContainer.css';
import { useState, useEffect } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


export function CollapsibleContainer({
  content,
  title,
  classNames = '',
  defaultCollapsed = false,
}) {
  // const { isCollapsed, toggleCollapsed } = useCollapsible(defaultCollapsed);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [expanded, setExpanded] = useState(!defaultCollapsed);

  // Sync internal state with prop changes
  useEffect(() => {
    setExpanded(!defaultCollapsed);
  }, [defaultCollapsed]);
  // const toggleCollapsed = () => {
  //   setIsCollapsed((prev) => !prev);
  // };

    // const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({

  // const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  //   padding: theme.spacing(2),
  //   borderTop: '1px solid rgba(0, 0, 0, .125)',
  //   backgroundColor: 'var(--background-dark)',
  // }));

  // const AccordianSX = {

  // }

  return (
    <Accordion
      // classes={{classNames}}
      expanded={expanded}
      onChange={(event, isExpanded) => {
        setExpanded(isExpanded);
      }}
      square={true}
      disableGutters={true}
      // sx={{

      // }}
      >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: classNames === 'completed' ?
            'var(--color-correct)' : classNames === 'incorrect' ?
            'var(--color-incorrect)' : 'var(--background-secondary)',
        }}
        >
        {title}
      </AccordionSummary>
      <AccordionDetails>
        {content}
      </AccordionDetails>
    </Accordion>
  )
  return (
    <div
      className={`collapsable-container ${classNames} ${isCollapsed ? 'collapsable-container_collapsed' : ''}`}
    >
      <div className="collapsable-container__title">
        <button
          className="collapsable-container__toggle-button"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? 'Expand container' : 'Collapse container'}
        >
          {isCollapsed ? `▶ ${title}` : `▼ ${title}`}
        </button>
      </div>
      {/* {!isCollapsed && ( */}
        <div className="collapsable-container__content">{content}</div>
      {/* )} */}
    </div>
  );
}
