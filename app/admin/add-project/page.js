"use client";

import ProjectForm from "@/components/forms/ProjectForm";

/**
 * Add Upcoming Project Page.
 * Renders the unified ProjectForm in "create" mode.
 */
export default function AddUpcomingProject() {
  return (
    <div className="max-w-4xl mx-auto w-full min-h-[80vh] flex flex-col justify-center py-8">
      <ProjectForm mode="create" />
    </div>
  );
}
