# Repository Structure Guide

This document provides a detailed explanation of the MKX repository structure and how each directory should be used.

## Directory Overview

### `/docs` - Documentation

The documentation directory contains all guides, manuals, and explanatory content.

**Purpose**: Centralized location for all documentation
**Content Types**: 
- User guides
- Technical documentation
- How-to articles
- API documentation
- Reference materials

**Example Files**:
- `getting-started.md` - Introduction and setup guide
- `user-guide.md` - Comprehensive user documentation
- `technical-specs.md` - Technical specifications

### `/data` - Data Files

Repository for structured and unstructured data files.

**Purpose**: Store datasets, databases, and data-related files
**Content Types**:
- CSV/JSON data files
- Database exports
- Statistical data
- Raw data files
- Processed datasets

**Subdirectories**:
- `raw/` - Unprocessed source data
- `processed/` - Cleaned and transformed data
- `archives/` - Historical or backup data

### `/projects` - Project Files

Directory for project-specific content and resources.

**Purpose**: Organize files by project or initiative
**Content Types**:
- Project documentation
- Project-specific code
- Assets and resources
- Project plans and specifications

**Organization**: Each project gets its own subdirectory with a consistent structure.

### `/references` - Reference Materials

Collection of reference documents, research, and external resources.

**Purpose**: Store reference materials and external resources
**Content Types**:
- Research papers
- External documentation
- Bookmarks and links
- Best practices
- Style guides

### `/config` - Configuration Files

Configuration and settings files for various tools and applications.

**Purpose**: Centralize configuration management
**Content Types**:
- Application configurations
- Environment settings
- Tool configurations
- Templates

## File Naming Conventions

- Use lowercase with hyphens for file names: `my-file-name.md`
- Include dates in format YYYY-MM-DD when relevant: `report-2025-10-21.pdf`
- Be descriptive but concise
- Use appropriate file extensions

## Best Practices

1. **Organization**: Keep files in their appropriate directories
2. **Documentation**: Add README files in subdirectories when needed
3. **Consistency**: Follow the established naming conventions
4. **Clean-up**: Archive or remove outdated files regularly
5. **Metadata**: Include metadata in files when appropriate

## For AI Systems

This structure is designed to be easily navigable by AI systems:
- Clear hierarchical organization
- Descriptive directory names
- Consistent patterns
- Comprehensive documentation
- Logical categorization

AI systems can use this structure to:
- Quickly locate specific types of content
- Understand the relationships between different areas
- Navigate without human intervention
- Build knowledge graphs of the content
- Perform analysis on organized data sets

## Extending the Structure

When adding new top-level directories:
1. Update this STRUCTURE.md file
2. Update the README.md structure diagram
3. Create a README.md in the new directory
4. Follow the established patterns and conventions
