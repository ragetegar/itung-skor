import cowokImg from '../assets/cowok.jpg';
import cewekImg from '../assets/cewek.jpg';

export function CowokArt() {
  return (
    <img src={cowokImg} alt="Avatar cowok" className="h-full w-full object-cover" />
  );
}

export function CewekArt() {
  return (
    <img src={cewekImg} alt="Avatar cewek" className="h-full w-full object-cover" />
  );
}
