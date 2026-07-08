import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const toastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [doneMessage, setDoneMessage] = useState(null);

  const onSubmit = (event) => {
    event.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('form', 'moratorium.ai newsletter page');

    fetch('https://forms.moratorium.ai/?subscribe', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setSubmitting(false);
        if (!data.success) {
          toast.error(data.message, toastOptions);
          return;
        }
        setDoneMessage(data.message);
      })
      .catch(() => {
        setSubmitting(false);
        toast.error('There was an error with your subscription. Please try again.', toastOptions);
      });
  };

  if (doneMessage) {
    return (
      <div className="alert alert--success margin-top--md" role="alert">
        {doneMessage}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="margin-top--md">
      <input
        className="form-input"
        type="email"
        name="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '300px', maxWidth: '100%', height: '36px', marginRight: '10px', marginBottom: '10px' }}
        required
      />
      <button
        className="button button--primary"
        type="submit"
        disabled={submitting}
      >
        {submitting ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  );
}

export default function Newsletter() {
  return (
    <Layout
      title="Newsletter"
      description="Subscribe for updates on the risk of extinction from AI and what you can do about it.">
      <main>
        <div className="container margin-vert--lg" style={{ maxWidth: '720px' }}>
          <Heading as="h1">Newsletter</Heading>
          <p>
            Get occasional email updates on the risk of human extinction from AI:
            what's changing, what leading scientists are saying, what governments
            are (and aren't) doing, and concrete things you can do to help.
          </p>
          <p>
            We send emails only when there's something worth your attention, and
            you can unsubscribe at any time. We won't share your address with
            anyone.
          </p>
          <NewsletterForm />
          <p className="margin-top--lg">
            In the meantime: <a href="/#why">why an AI moratorium is necessary</a>,
            or <a href="https://whycare.aisgf.us">chat with our tool about AI risk</a>.
          </p>
        </div>
      </main>
      <ToastContainer />
    </Layout>
  );
}
