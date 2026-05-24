import Mascot from "@/assets/mascot.png";

type HeaderProps = {
  text: string;
};

export default function Header(title: HeaderProps) {
  return (
    <header className="h-20 flex items-center drop-shadow-lg bg-secondary-dark">
      <div className="flex items-center justify-start gap-4 px-5">
        <img src={Mascot} alt="logo" className="h-12 w-auto" />
        <h1 className="text-3xl text-primary-dark font-medium font-heading">
          {title.text}
        </h1>
      </div>
    </header>
  );
}
