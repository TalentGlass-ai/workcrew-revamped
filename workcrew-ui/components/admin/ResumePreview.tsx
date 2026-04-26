// PATH: workcrew-ui/components/admin/ResumePreview.tsx
"use client";

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Star } from 'lucide-react';

interface ParsedResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
  summary: string;
}

interface ResumePreviewProps {
  data: ParsedResumeData;
  onSave: (profileData: any) => void;
  onCancel: () => void;
}

export default function ResumePreview({ data, onSave, onCancel }: ResumePreviewProps) {
  const [editedData, setEditedData] = useState(data);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Transform data to match candidate profile schema
    const profileData = {
      name: editedData.name,
      email: editedData.email,
      phone: editedData.phone,
      location: editedData.location,
      summary: editedData.summary,
      experience: editedData.experience,
      education: editedData.education,
      skills: editedData.skills,
      // Additional fields for WorkCrew
      salaryExpectation: null,
      relocationPreference: false,
      remoteWorkPreference: 'flexible',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: ''
    };

    onSave(profileData);
  };

  const updateField = (field: string, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg border p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Resume Preview</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          {isEditing ? 'Preview' : 'Edit'}
        </button>
      </div>

      {/* Basic Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{editedData.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editedData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{editedData.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editedData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{editedData.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.location}
                onChange={(e) => updateField('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{editedData.location}</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Professional Summary</h3>
        {isEditing ? (
          <textarea
            value={editedData.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <p className="text-gray-700">{editedData.summary}</p>
        )}
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Briefcase className="w-5 h-5 mr-2" />
          Experience
        </h3>
        <div className="space-y-4">
          {editedData.experience.map((exp, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => {
                        const newExp = [...editedData.experience];
                        newExp[index] = { ...exp, title: e.target.value };
                        updateField('experience', newExp);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{exp.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...editedData.experience];
                        newExp[index] = { ...exp, company: e.target.value };
                        updateField('experience', newExp);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{exp.company}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => {
                        const newExp = [...editedData.experience];
                        newExp[index] = { ...exp, duration: e.target.value };
                        updateField('experience', newExp);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-600">{exp.duration}</p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                {isEditing ? (
                  <textarea
                    value={exp.description}
                    onChange={(e) => {
                      const newExp = [...editedData.experience];
                      newExp[index] = { ...exp, description: e.target.value };
                      updateField('experience', newExp);
                    }}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700">{exp.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {editedData.skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
}