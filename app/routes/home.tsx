import type { Route } from "./+types/home";
import Navbar from '~/components/Navbar';
import { resumes } from '../../constants';
import ResumeCard from '~/components/ResumeCard';
import { usePuterStore } from '~/lib/puter';
import { useLocation, useNavigate } from 'react-router';
import { useEffect } from 'react';



export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const next = location.search.split('next=')[1];
  const navigate = useNavigate();
  useEffect(() => {
    if (!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated]);
  // @ts-ignore
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar></Navbar>

      <section className="main-section">
        <div className="page-heading py-16"></div>
        <h1> Track your Applications & Resume Rating</h1>
        <h2>Review your submissions and check Ai-powered feedback.</h2>
        {resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume}></ResumeCard>
            ))}
          </div>
        )}
      </section>
    </main>
  );}
