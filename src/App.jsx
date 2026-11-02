import { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { initialProjects } from "../src/utils/initialProjects";
import { skillCategories } from "../src/utils/skillCategories";
import { modalTechCategories } from "../src/utils/modalTechCategories";
import * as goatcounter from "goatcounter-js";
import DEFAULT_MALE_AVATAR from "./assets/Sek.JPG";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  body {
    background-color: #0b0f19;
    color: #e2e8f0;
    overflow-x: hidden;
  }
`;

const YouTubeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const ProductionIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const PROJECTS_PER_PAGE = 10;

const allTechnologies = Array.from(
  new Set(initialProjects.flatMap((p) => p.techStack)),
).sort();

goatcounter.initialize({
  endpointUrl: "https://ВАШИЯТ_КОД.goatcounter.com/count",
  settings: { no_onload: true, allow_local: true },
});

export default function App() {
  const [openProjectId, setOpenProjectId] = useState(null);
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Кеш на заредените снимки по projectId
  const [projectImages, setProjectImages] = useState({});
  // Кой проект в момента зарежда (за spinner)
  const [loadingProjectId, setLoadingProjectId] = useState(null);

  // SENIOR: lazy load САМО на конкретния проект при клик
  const toggleProject = async (project) => {
    if (openProjectId === project.id) {
      setOpenProjectId(null);
      return;
    }

    setOpenProjectId(project.id);

    // Вече заредено → 0 заявки
    if (projectImages[project.id]) return;

    // Проект без снимки
    if (typeof project.images !== "function") {
      setProjectImages((prev) => ({ ...prev, [project.id]: [] }));
      return;
    }

    setLoadingProjectId(project.id);
    try {
      const urls = await project.images();
      setProjectImages((prev) => ({ ...prev, [project.id]: urls }));
    } catch (err) {
      console.error(`Failed to load images for project ${project.id}`, err);
      setProjectImages((prev) => ({ ...prev, [project.id]: [] }));
    } finally {
      setLoadingProjectId(null);
    }
  };

  const [lightbox, setLightbox] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0,
    projectTitle: "",
  });

  const currentAvatar = DEFAULT_MALE_AVATAR;

  const isFiltering = selectedTechs.length > 0;

  const handleToggleTech = (tech) => {
    if (selectedTechs.includes(tech)) {
      setSelectedTechs(selectedTechs.filter((t) => t !== tech));
    } else {
      setSelectedTechs([...selectedTechs, tech]);
    }
  };

  const handleRemoveTech = (e, tech) => {
    e.stopPropagation();
    setSelectedTechs(selectedTechs.filter((t) => t !== tech));
  };

  const handleClear = () => {
    setSelectedTechs([]);
  };

  const toggleAccordion = (id) => {
    setOpenProjectId((prev) => (prev === id ? null : id));
  };

  const openLightbox = (images, index, projectTitle) => {
    setLightbox({
      isOpen: true,
      images,
      currentIndex: index,
      projectTitle,
    });
  };

  const closeLightbox = () => {
    setLightbox((prev) => ({ ...prev, isOpen: false }));
  };

  const nextImage = (e) => {
    if (e) e.stopPropagation();
    setLightbox((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
    }));
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    setLightbox((prev) => ({
      ...prev,
      currentIndex:
        (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
    }));
  };

  useEffect(() => {
    setCurrentPage(1);
    const handleKeyDown = (e) => {
      if (!lightbox.isOpen) return;
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      goatcounter.count();
    };
  }, [selectedTechs, lightbox.isOpen]);

  const displayedProjects = (() => {
    if (!isFiltering) {
      return initialProjects;
    }

    const matching = initialProjects.filter((project) =>
      selectedTechs.some((tech) => project.techStack.includes(tech)),
    );

    return [...matching].sort((a, b) => {
      const firstMatchA = selectedTechs.findIndex((tech) =>
        a.techStack.includes(tech),
      );

      const firstMatchB = selectedTechs.findIndex((tech) =>
        b.techStack.includes(tech),
      );

      if (firstMatchA !== firstMatchB) {
        return firstMatchA - firstMatchB;
      }

      return a.id - b.id;
    });
  })();

  const totalPages = Math.ceil(displayedProjects.length / PROJECTS_PER_PAGE);
  const paginatedProjects = displayedProjects.slice(
    (currentPage - 1) * PROJECTS_PER_PAGE,
    currentPage * PROJECTS_PER_PAGE,
  );

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    setOpenProjectId(null);
  };

  const scrollToTop = () => {
    document.getElementById("fullStackDeveloper")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <RoleTitle id="fullStackDeveloper">Full Stack Developer</RoleTitle>
        <NameTitle>Sekul Kamberov</NameTitle>

        <Avatar src={currentAvatar} alt="Sekul Kamberov" />

        <EmailLink
          href="mailto:fullstackstudio2@gmail.com"
          title="Send an email"
        >
          <MailSvg viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </MailSvg>
          <span>fullstackstudio2@gmail.com</span>
        </EmailLink>
        {!isFiltering && (
          <>
            <SectionTitle>Summary</SectionTitle>
            <SummaryText>
              Full-Stack Developer with 9+ years of experience architecting and
              delivering scalable web and mobile applications. Strong expertise
              in .NET, distributed systems, microservices, cloud infrastructure,
              and modern software engineering practices. Focused on AI
              engineering and the development of intelligent applications,
              combining proven software architecture expertise with modern AI
              technologies to build scalable, high-performance, and
              production-ready solutions. Passionate about technical innovation,
              system design, and engineering excellence.
            </SummaryText>

            <SkillsSectionWrapper>
              <SkillsToggleHeader
                onClick={() => setIsSkillsOpen((prev) => !prev)}
                title="Click to expand/collapse skills"
              >
                <SkillsTitleRow>
                  <span>SKILLS</span>
                  <ArrowIcon $isOpen={isSkillsOpen}>▼</ArrowIcon>
                </SkillsTitleRow>
                {/* <SkillsUnderline /> */}
              </SkillsToggleHeader>

              {isSkillsOpen && (
                <CategoriesGrid>
                  {skillCategories.map((group) => (
                    <CategoryCard key={group.category}>
                      <CategoryLabel>{group.category}</CategoryLabel>

                      <SkillsBoxList>
                        {group.skills.map((skill) => (
                          <SkillBox key={skill}>{skill}</SkillBox>
                        ))}
                      </SkillsBoxList>
                    </CategoryCard>
                  ))}
                </CategoriesGrid>
              )}
            </SkillsSectionWrapper>
          </>
        )}
        <SectionTitle>Personal Projects</SectionTitle>
        {isFiltering && (
          <ActiveFiltersBar>
            {selectedTechs.map((tech) => (
              <FilterChip key={tech}>
                {tech}
                <ChipRemoveBtn onClick={(e) => handleRemoveTech(e, tech)}>
                  ✕
                </ChipRemoveBtn>
              </FilterChip>
            ))}
          </ActiveFiltersBar>
        )}
        <ProjectsList>
          {paginatedProjects.map((project) => {
            const isOpen = openProjectId === project.id;
            const isLoading = loadingProjectId === project.id;
            const imgs = projectImages[project.id] || [];

            return (
              <ProjectCard key={project.id}>
                <ProjectHeader onClick={() => toggleProject(project)}>
                  <HeaderTopRow>
                    <ProjectTitle>
                      {project.title}
                      <Year>{project.year}</Year>
                    </ProjectTitle>
                    <ArrowIcon $isOpen={isOpen}>▼</ArrowIcon>
                  </HeaderTopRow>

                  <BadgeContainer>
                    {project.labels.map((label, idx) => (
                      <Badge key={idx}>{label}</Badge>
                    ))}
                  </BadgeContainer>

                  <TechStackLine>
                    <strong>Tech Stack:</strong> {project.techStack.join(", ")}
                  </TechStackLine>
                </ProjectHeader>

                {isOpen && (
                  <ProjectContent>
                    <LinksRow>
                      {project.youtubeUrl && (
                        <ProjectLink
                          href={project.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          $variant="youtube"
                        >
                          <YouTubeIcon />
                          <span>YouTube</span>
                        </ProjectLink>
                      )}
                      {project.liveUrl && (
                        <ProjectLink
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          $variant="live"
                        >
                          <ProductionIcon />
                          <span>Prod</span>
                        </ProjectLink>
                      )}
                      {project.githubUrl && (
                        <ProjectLink
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          $variant="github"
                        >
                          <GitHubIcon />
                          <span>GitHub</span>
                        </ProjectLink>
                      )}
                    </LinksRow>

                    {isLoading && (
                      <ImagesPlaceholder>
                        Loading screenshots…
                      </ImagesPlaceholder>
                    )}

                    {!isLoading && imgs.length > 0 && (
                      <ImagesGrid>
                        {imgs.map((imgUrl, i) => (
                          <ImageCard
                            key={i}
                            onClick={() => openLightbox(imgs, i, project.title)}
                            title="Click to expand view"
                          >
                            <ProjectImg
                              src={imgUrl}
                              alt={`${project.title} Preview ${i + 1}`}
                              loading="lazy"
                              decoding="async"
                            />
                          </ImageCard>
                        ))}
                      </ImagesGrid>
                    )}

                    <ProjectDesc>{project.description}</ProjectDesc>
                  </ProjectContent>
                )}
              </ProjectCard>
            );
          })}
        </ProjectsList>

        {totalPages > 1 && (
          <PaginationWrapper>
            <PaginationButton
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              Prev
            </PaginationButton>

            <PaginationPages>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <PaginationButton
                    key={page}
                    $active={currentPage === page}
                    onClick={() => goToPage(page)}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </PaginationButton>
                ),
              )}
            </PaginationPages>

            <PaginationButton
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next
            </PaginationButton>
          </PaginationWrapper>
        )}

        <FloatingWrapper>
          <TopButton onClick={scrollToTop}>Top</TopButton>
          <FilterFab
            onClick={() => setIsModalOpen(true)}
            title="Filter by technologies"
          >
            Filter
          </FilterFab>

          {isFiltering && (
            <ClearFab onClick={handleClear} title="Clear filter">
              Clear
            </ClearFab>
          )}
        </FloatingWrapper>

        {/* {isModalOpen && (
          <ModalBackdrop onClick={() => setIsModalOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalHeading>Tech Filters</ModalHeading>
                <ModalCloseBtn onClick={() => setIsModalOpen(false)}>
                  X
                </ModalCloseBtn>
              </ModalHeader>

              <TechList>
                {allTechnologies.map((tech) => {
                  const isSelected = selectedTechs.includes(tech);
                  return (
                    <TechItem
                      key={tech}
                      $isSelected={isSelected}
                      onClick={() => handleToggleTech(tech)}
                    >
                      <span>{tech}</span>
                      {isSelected && (
                        <RemoveButton
                          onClick={(e) => handleRemoveTech(e, tech)}
                          title="Remove from selection"
                        >
                          ✕
                        </RemoveButton>
                      )}
                    </TechItem>
                  );
                })}
              </TechList>
            </ModalContent>
          </ModalBackdrop>
        )} */}
        {isModalOpen && (
          <ModalBackdrop onClick={() => setIsModalOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalHeading>Tech Filters</ModalHeading>
                <ModalCloseBtn onClick={() => setIsModalOpen(false)}>
                  X
                </ModalCloseBtn>
              </ModalHeader>

              <TechModalContainer>
                {modalTechCategories.map((group) => (
                  <TechCategoryGroup key={group.category}>
                    <TechCategoryTitle>{group.category}</TechCategoryTitle>
                    <TechList>
                      {group.techs.map((tech) => {
                        const isSelected = selectedTechs.includes(tech);
                        return (
                          <TechItem
                            key={tech}
                            $isSelected={isSelected}
                            onClick={() => handleToggleTech(tech)}
                          >
                            <span>{tech}</span>
                            {isSelected && (
                              <RemoveButton
                                onClick={(e) => handleRemoveTech(e, tech)}
                                title="Remove from selection"
                              >
                                ✕
                              </RemoveButton>
                            )}
                          </TechItem>
                        );
                      })}
                    </TechList>
                  </TechCategoryGroup>
                ))}
              </TechModalContainer>
            </ModalContent>
          </ModalBackdrop>
        )}
        {lightbox.isOpen && (
          <LightboxOverlay onClick={closeLightbox}>
            <LightboxContainer onClick={(e) => e.stopPropagation()}>
              <LightboxHeader>
                <LightboxCloseBtn onClick={closeLightbox}>✕</LightboxCloseBtn>
              </LightboxHeader>

              <LightboxImageWrapper>
                <NavArrowButton
                  $side="left"
                  onClick={prevImage}
                  title="Previous image (←)"
                >
                  ◀
                </NavArrowButton>

                <FullImage
                  src={lightbox.images[lightbox.currentIndex]}
                  alt="Full preview"
                />

                <NavArrowButton
                  $side="right"
                  onClick={nextImage}
                  title="Next image (→)"
                >
                  ▶
                </NavArrowButton>
              </LightboxImageWrapper>
            </LightboxContainer>
          </LightboxOverlay>
        )}
      </PageContainer>
    </>
  );
}

const PageContainer = styled.main`
  width: 100%;
  border: none;
  outline: none;
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1.25rem 7rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const RoleTitle = styled.div`
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  font-weight: 700;
  color: #38bdf8;
  margin-bottom: 0.2rem;
`;

const NameTitle = styled.div`
  font-size: clamp(2.1rem, 4vw, 3rem);
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 2rem;
`;

const Avatar = styled.img`
  width: 280px;
  height: 280px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #38bdf8;
  box-shadow: 0 10px 30px rgba(56, 189, 248, 0.2);
  margin-bottom: 1rem;

  @media (max-width: 480px) {
    width: 250px;
    height: 250px;
  }
`;

const SummaryText = styled.p`
  max-width: 800px;
  font-size: clamp(0.95rem, 1.8vw, 1.15rem);
  line-height: 1.7;
  color: #cbd5e1;
  margin: 0 auto;
`;

const ActiveFiltersBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.8rem;
  color: #94a3b8;
  font-size: 0.9rem;
`;

const FilterChip = styled.span`
  background: rgba(249, 115, 22, 0.15);
  border: 1px solid #f97316;
  color: #f97316;
  border-radius: 10px;
  padding: 8px 15px;
  font-size: 1.2rem;
  display: inline-flex;
  align-items: center;
  gap: 7px;
`;

const ChipRemoveBtn = styled.button`
  background: transparent;
  border: none;
  color: #f97316;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;

  &:hover {
    color: #ffffff;
  }
`;

const ProjectsList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProjectCard = styled.div`
  overflow: hidden;
`;

const ProjectHeader = styled.div`
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  text-align: left;
`;

const HeaderTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.7rem;
`;

const ProjectTitle = styled.h4`
  font-size: clamp(1.4rem, 2.8vw, 1.85rem); /* Увеличено (беше 1.1rem) */
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.01em;
`;

const ArrowIcon = styled.span`
  font-size: 1.4rem;
  color: #38bdf8;
  display: inline-block;
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(0deg)" : "rotate(-90deg)")};
  transition: transform 0.3s ease;
`;

const BadgeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const Badge = styled.span`
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  font-size: clamp(
    0.95rem,
    1.8vw,
    1.15rem
  ); /* Увеличено (беше едва 0.75rem!) */
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(56, 189, 248, 0.4);
`;

const TechStackLine = styled.div`
  font-size: clamp(
    1.05rem,
    2vw,
    1.25rem
  ); /* Равно и дори малко по-голямо от Skills */
  color: #cbd5e1;
  line-height: 1.6;
  margin-top: 0.3rem;

  strong {
    color: #38bdf8;
    font-weight: 700;
  }
`;

const ProjectContent = styled.div`
  padding: 1.2rem 1.5rem 1.8rem 1.5rem;
  border-top: 1px solid #1f2937;
  text-align: left;
`;

const ProjectDesc = styled.p`
  font-size: clamp(
    1.05rem,
    2vw,
    1.25rem
  ); /* Увеличено за лесно и приятно четене */
  color: #e2e8f0;
  line-height: 1.75;
  margin-bottom: 1.8rem;
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
  width: 100%;
`;

const ImageCard = styled.div`
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: auto;

  transition:
    transform 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #38bdf8;
  }
`;

const ProjectImg = styled.img`
  width: 100%;
  height: 150%;
  //max-height: 350px;
  object-fit: contain;
  display: block;
`;
const LinksRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 1.7rem;
`;

const ProjectLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: clamp(1rem, 2vw, 1.2rem);
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  /* YouTube Styling */
  ${({ $variant }) =>
    $variant === "youtube" &&
    `
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
    &:hover {
      background: #ef4444;
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
    }
  `}

  /* Production Link Styling */
  ${({ $variant }) =>
    $variant === "live" &&
    `
    background: rgba(56, 189, 248, 0.12);
    color: #38bdf8;
    border-color: rgba(56, 189, 248, 0.3);
    &:hover {
      background: #38bdf8;
      color: #0b0f19;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(56, 189, 248, 0.4);
    }
  `}

  /* GitHub Styling */
  ${({ $variant }) =>
    $variant === "github" &&
    `
    background: rgba(241, 245, 249, 0.1);
    color: #f1f5f9;
    border-color: rgba(241, 245, 249, 0.25);
    &:hover {
      background: #ffffff;
      color: #0b0f19;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 255, 255, 0.3);
    }
  `}

  @media (max-width: 480px) {
    font-size: 0.95rem;
    padding: 10px 16px;
    gap: 8px;
    svg {
      width: 22px;
      height: 22px;
    }
  }
`;

const LightboxOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
`;

const LightboxContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1500px;
  height: calc(100dvh - 48px);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 0;
`;

const LightboxHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: end;
  align-items: center;
  margin-bottom: 1rem;
  color: #f1f5f9;
`;

const LightboxCloseBtn = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 1.2rem;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    background: #ef4444;
    border-color: #ef4444;
  }
`;

const LightboxImageWrapper = styled.div`
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FullImage = styled.img`
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;

  object-fit: contain;
  object-position: center;

  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);

  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
`;

const NavArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $side }) => ($side === "left" ? "left: 15px;" : "right: 15px;")}
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-size: 1.4rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background: #38bdf8;
    color: #0b0f19;
    border-color: #38bdf8;
    transform: translateY(-50%) scale(1.1);
  }

  @media (max-width: 600px) {
    width: 42px;
    height: 42px;
    font-size: 1.1rem;
    ${({ $side }) => ($side === "left" ? "left: 5px;" : "right: 5px;")}
  }
`;

const FloatingWrapper = styled.div`
  position: fixed;
  bottom: 25px;
  right: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 100;
`;

const FilterFab = styled.button`
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: #2563eb;
  color: #ffffff;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
  transition:
    transform 0.2s,
    background 0.2s;

  &:hover {
    transform: scale(1.08);
    background: #1d4ed8;
  }
`;

const ClearFab = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #f97316;
  color: #ffffff;
  border: none;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
  transition:
    transform 0.2s,
    background 0.2s;

  &:hover {
    transform: scale(1.08);
    background-color: #ea580c;
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: #1e293b;
  border-radius: 35px;
  padding: 1.5rem;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
  border: 1px solid #334155;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
`;

const ModalHeading = styled.h3`
  color: #f8fafc;
  font-size: 1.6rem;
`;

const ModalCloseBtn = styled.button`
  background: transparent;
  border: 1px solid #475569;
  border-radius: 50%;
  color: #cbd5e1;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  &:hover {
    background: #334155;
    color: #ffffff;
  }
`;

const TechList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 5px;
`;

const TechItem = styled.div`
  background: ${({ $isSelected }) =>
    $isSelected ? "rgba(249, 115, 22, 0.15)" : "#0f172a"};
  color: ${({ $isSelected }) => ($isSelected ? "#f97316" : "#e2e8f0")};
  font-size: 0.85rem;
  padding: 8px 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  border: ${({ $isSelected }) =>
    $isSelected ? "2px solid #f97316" : "1px solid transparent"};
  border-radius: ${({ $isSelected }) => ($isSelected ? "8px" : "6px")};

  &:hover {
    ${({ $isSelected }) =>
      !$isSelected &&
      `
      border: 1px solid #38bdf8;
      border-radius: 10px;
      background: #1e293b;
      color: #38bdf8;
    `}
  }
`;

const RemoveButton = styled.span`
  font-size: 0.75rem;
  font-weight: bold;
  color: #f97316;
  padding: 1px 4px;
  border-radius: 4px;

  &:hover {
    background: #f97316;
    color: #ffffff;
  }
`;

const SkillsSectionWrapper = styled.div`
  width: 100%;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
`;

const SkillsToggleHeader = styled.div`
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  margin-bottom: 2.5rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const SkillsTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: 0.05em;
`;

const SectionTitle = styled.h2`
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 700;
  color: #f8fafc;
  margin-top: 2rem;
  margin-bottom: 2.5rem;
  position: relative;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const CategoriesGrid = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
`;

const CategoryCard = styled.div`
  padding: 1.8rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;

  @media (max-width: 600px) {
    padding: 1.2rem;
  }
`;

const CategoryLabel = styled.span`
  font-size: clamp(1.25rem, 2.5vw, 1.55rem);
  font-weight: 700;
  color: #38bdf8;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  //border-bottom: 2px solid rgba(56, 189, 248, 0.3);
  padding-bottom: 4px;
`;

const SkillsBoxList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
`;

const SkillBox = styled.div`
  background: #1e293b;
  color: #f1f5f9;
  font-size: clamp(1rem, 2vw, 1.2rem);
  font-weight: 600;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #334155;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease-in-out;
  cursor: default;

  &:hover {
    border-color: #38bdf8;
    background: #0f172a;
    color: #38bdf8;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(56, 189, 248, 0.15);
  }

  @media (max-width: 480px) {
    padding: 8px 14px;
    font-size: 0.95rem;
  }
`;

const EmailLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 0.2rem;
  margin-bottom: 2rem;
  padding: 10px 22px;

  color: #38bdf8;
  font-size: clamp(1.4rem, 2vw, 1.1rem);
  font-weight: 400;
  text-decoration: none;
  letter-spacing: 0.03em;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  transition: all 0.25s ease-in-out;

  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 8px 16px;
    gap: 8px;
  }
`;

const MailSvg = styled.svg`
  width: 30px;
  height: 30px;
  fill: currentColor;
  transition: transform 0.2s ease;
`;

const Year = styled.span`
  padding-left: 0.5rem;
  color: #ff6b00;
`;

const PaginationWrapper = styled.nav`
  position: fixed;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: calc(100vw - 150px);
  padding: 10px 12px;
  border-radius: 21px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);

  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  @media (max-width: 600px) {
    bottom: 12px;
    max-width: calc(100vw - 100px);
    gap: 4px;
    padding: 8px;
  }
`;

const PaginationPages = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 5px;

  overflow-x: auto;
  max-width: 45vw;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 600px) {
    gap: 3px;
    max-width: 40vw;
  }
`;

const PaginationButton = styled.button`
  flex-shrink: 0;
  min-width: 38px;
  height: 38px;
  padding: 0 10px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: 1px solid ${({ $active }) => ($active ? "#ff6b00" : "#334155")};

  border-radius: 18px;

  background: ${({ $active }) => ($active ? "#ff6b00" : "#1e293b")};

  color: ${({ $active }) => ($active ? "#0b0f19" : "#e2e8f0")};

  font-size: 0.9rem;
  font-weight: 700;

  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;

  &:hover:not(:disabled) {
    border-color: #ff6b00;
    background: ${({ $active }) => ($active ? "#ff6b00" : "#0f172a")};
    color: ${({ $active }) => ($active ? "#0b0f19" : "#ff6b00")};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #ff6b00;
    outline-offset: 2px;
  }

  @media (max-width: 600px) {
    min-width: 32px;
    height: 34px;
    padding: 0 7px;
    font-size: 0.8rem;
  }
`;

const TopButton = styled.button`
  width: 62px;
  height: 62px;
  min-width: 62px;
  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 2px solid #3478d4;
  border-radius: 50%;
  background: transparent;
  color: #3478d4;

  font-size: 16px;
  font-weight: 700;

  cursor: pointer;
  box-shadow: none;
  transition:
    background 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: rgb(52 120 212 / 12%);
    color: #8bb8ff;
  }
`;

const ImagesPlaceholder = styled.div`
  width: 100%;
  padding: 2rem 1rem;
  margin: 1.5rem 0;
  text-align: center;
  color: #94a3b8;
  font-size: clamp(1.3rem, 2vw, 1.5rem);
  font-weight: 500;
  letter-spacing: 0.03em;
`;

// const TechModalContainer = styled.div`
//   max-height: 60vh;
//   overflow-y: auto;
//   padding-right: 5px;
//   display: flex;
//   flex-direction: column;
//   text-align: left;
// `;

// const TechCategoryGroup = styled.div`
//   margin-bottom: 1.5rem; /* Търсеното разстояние между различните технологии/категории */

//   &:last-child {
//     margin-bottom: 0;
//   }
// `;

// const TechCategoryTitle = styled.h4`
//   font-size: 0.95rem;
//   font-weight: 700;
//   color: #38bdf8;
//   margin-bottom: 0.6rem;
//   text-transform: uppercase;
//   letter-spacing: 0.05em;
// `;

const TechModalContainer = styled.div`
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 5px;
  display: flex;
  flex-direction: column;
  text-align: left;
`;

const TechCategoryGroup = styled.div`
  margin-bottom: 1.5rem; /* Търсеното разстояние между различните технологии/категории */

  &:last-child {
    margin-bottom: 0;
  }
`;

const TechCategoryTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 700;
  color: #38bdf8;
  margin-bottom: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;
