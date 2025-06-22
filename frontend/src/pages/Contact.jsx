import './AboutContact.css';

const Contact = () => {

  return (
    <div className="about-contact-container">
      <section className="hero-section">
        <h1>Get In Touch</h1>
        <p>Have questions about VoteEase? Reach out to our team</p>
      </section>

      <div className="content-grid">
        {/* Contact Form */}


        {/* Contact Info */}
        <section className="card contact-info-card">
          <h2>Ways to Connect</h2>

          <div className="contact-method">
            <div className="icon">📧</div>
            <div>
              <h3>Email</h3>
              <a href="mailto:voteeaseofficial@gmail.com">voteeaseofficial@gmail.com</a>
            </div>
          </div>

          <div className="contact-method">
            <div className="icon">👥</div>
            <div>
              <h3>Our Team</h3>
              <div className="team-profiles">
                {/* Team Member 1 */}
                <a
                  href="https://www.linkedin.com/in/taneeshka-reddy-b720a8260"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="team-member"
                >
                  <span className="member-icon">👩‍💻</span>
                  <span>Taneeshka Naganath Reddy</span>
                </a>

                {/* Team Member 2 */}
                <a
                  href="https://www.linkedin.com/in/madhusudhan-34090a292"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="team-member"
                >
                  <span className="member-icon">🧑‍💻</span>
                  <span>Madhusudhan</span>
                </a>

                {/* Team Member 3 */}
                <a
                  href="https://www.linkedin.com/in/harsha-n-c-6738a2275"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="team-member"
                >
                  <span className="member-icon">👨‍💻</span>
                  <span>Harsha N C</span>
                </a>

                {/* Team Member 4 */}
                <a
                  href="https://www.linkedin.com/in/sanket-4b6b17291"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="team-member"
                >
                  <span className="member-icon">👨‍💻</span>
                  <span>Sanket</span>
                </a>
              </div>
            </div>
          </div>

          {/* <div className="contact-method">
            <div className="icon">🔗</div>
            <div>
              <h3>GitHub</h3>
              <a
                href="https://github.com/voteease"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/voteease
              </a>
            </div>
          </div> */}
        </section>
      </div>
    </div>
  );
};

export default Contact;