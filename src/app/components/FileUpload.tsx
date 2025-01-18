"use client";

import React, { useState, useRef } from "react";
import {
  FaCloudUploadAlt,
  FaInstagram,
  FaUsers,
  FaUserSlash,
  FaSpinner,
  FaUserCircle,
} from "react-icons/fa";

interface FollowData {
  username: string;
  profileLink: string;
  profilePicture?: string;
}

const FileUpload: React.FC = () => {
  const [followingFile, setFollowingFile] = useState<File | null>(null);
  const [followersFile, setFollowersFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    notFollowingBack: FollowData[];
    totalFollowing: number;
    totalFollowers: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const followingInputRef = useRef<HTMLInputElement>(null);
  const followersInputRef = useRef<HTMLInputElement>(null);

  const ProfilePicture = ({
    src,
    alt,
    className,
  }: {
    src?: string;
    alt: string;
    className?: string;
  }) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
      setImageError(true);
    };

    if (imageError || !src) {
      return <FaUserCircle className={`text-gray-400 ${className}`} />;
    }

    return (
      <img
        src={src}
        alt={alt}
        onError={handleImageError}
        className={`object-cover rounded-full ${className}`}
      />
    );
  };

  const handleFileChange = (
    type: "following" | "followers",
    file: File | null
  ) => {
    if (type === "following") {
      setFollowingFile(file);
    } else {
      setFollowersFile(file);
    }
  };

  const extractUsernames = (file: File): Promise<FollowData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          const users = jsonData.relationships_following
            ? jsonData.relationships_following.map((item: any) => ({
                username: item.string_list_data[0].value,
                profileLink: `https://www.instagram.com/${item.string_list_data[0].value}/`,
                profilePicture: `https://github.com/${item.string_list_data[0].value}.png`,
              }))
            : jsonData.map((item: any) => ({
                username: item.string_list_data[0].value,
                profileLink: `https://www.instagram.com/${item.string_list_data[0].value}/`,
                profilePicture: `https://github.com/${item.string_list_data[0].value}.png`,
              }));

          resolve(users);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  const analyzeFollowRelationships = async () => {
    if (!followingFile || !followersFile) {
      alert("Please upload both following and followers files");
      return;
    }

    setIsLoading(true);

    try {
      const followingUsers = await extractUsernames(followingFile);
      const followersUsers = await extractUsernames(followersFile);

      const followingSet = new Set(followingUsers.map((u) => u.username));
      const followersSet = new Set(followersUsers.map((u) => u.username));

      const notFollowingBack = followingUsers.filter(
        (user) => !followersSet.has(user.username)
      );

      setAnalysisResult({
        notFollowingBack,
        totalFollowing: followingUsers.length,
        totalFollowers: followersUsers.length,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Error processing files. Please check file format.");
    } finally {
      setIsLoading(false);
    }
  };

  const FileUploadCard = ({
    type,
    file,
    inputRef,
    onChange,
  }: {
    type: "following" | "followers";
    file: File | null;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (file: File | null) => void;
  }) => (
    <div className="relative group" onClick={() => inputRef.current?.click()}>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      <div
        className="w-full h-40 border-2 border-dashed rounded-lg cursor-pointer 
        flex flex-col items-center justify-center transition-all 
        group-hover:border-blue-500 
        group-hover:bg-blue-50
        border-gray-300 bg-gray-50"
      >
        {file ? (
          <div className="text-center">
            <p className="text-sm text-gray-700">{file.name}</p>
            <p className="text-xs text-gray-500">
              {Math.round(file.size / 1024)} KB
            </p>
          </div>
        ) : (
          <>
            <FaCloudUploadAlt className="text-5xl text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Upload {type} JSON file</p>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 
      flex items-center justify-center p-4"
    >
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-4xl">
        <div className="flex items-center justify-center mb-6">
          <FaInstagram className="text-4xl mr-3 text-pink-600" />
          <h1 className="text-3xl font-bold text-gray-800">
            Instagram Follower Analyzer
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <FileUploadCard
            type="following"
            file={followingFile}
            inputRef={followingInputRef}
            onChange={(file) => handleFileChange("following", file)}
          />
          <FileUploadCard
            type="followers"
            file={followersFile}
            inputRef={followersInputRef}
            onChange={(file) => handleFileChange("followers", file)}
          />
        </div>

        <button
          onClick={analyzeFollowRelationships}
          disabled={!followingFile || !followersFile || isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 
            text-white py-3 rounded-lg hover:opacity-90 
            transition-all flex items-center justify-center 
            disabled:opacity-50"
        >
          {isLoading ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : (
            <FaUsers className="mr-2" />
          )}
          {isLoading ? "Analyzing..." : "Analyze Follow Relationships"}
        </button>

        {analysisResult && (
          <div className="mt-6 bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-100 p-4 rounded-lg flex items-center">
                <FaUsers className="text-3xl text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Following</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analysisResult.totalFollowing}
                  </p>
                </div>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg flex items-center">
                <FaUserSlash className="text-3xl text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Not Following Back</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {analysisResult.notFollowingBack.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {analysisResult.notFollowingBack.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center bg-white p-3 rounded-lg mb-2 shadow-sm hover:shadow-md transition-all"
                >
                  <ProfilePicture
                    src={user.profilePicture}
                    alt={`${user.username} profile`}
                    className="w-10 h-10 mr-4"
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-gray-800">{user.username}</p>
                  </div>
                  <a
                    href={user.profileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white px-3 py-1 rounded-full 
                      hover:bg-blue-600 transition-colors text-sm"
                  >
                    View Profile
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
