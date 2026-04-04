

export const FeatureCard = ({ icon, title, desc }) => (
  <div className="feature-card">
    <div className="feature-card__icon">
      <i className={icon} />
    </div>
    <p className="feature-card__title">{title}</p>
    <p className="feature-card__desc">{desc}</p>
  </div>
);


export const Fonts = () => {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
        rel="stylesheet"
      />
    </>
  );
};

