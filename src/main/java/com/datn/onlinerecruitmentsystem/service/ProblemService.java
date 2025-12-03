package com.datn.onlinerecruitmentsystem.service;

import com.datn.onlinerecruitmentsystem.dto.ProblemDTO;
import com.datn.onlinerecruitmentsystem.entity.Problem;
import com.datn.onlinerecruitmentsystem.entity.TestCase;
import com.datn.onlinerecruitmentsystem.repository.ProblemRepository;
import com.datn.onlinerecruitmentsystem.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;

    private String generateSlug(String title) {
        if (title == null || title.trim().isEmpty()) {
            return UUID.randomUUID().toString().substring(0, 10);
        }
        String slug = title.trim().toLowerCase();
        slug = slug.replaceAll("[^a-z0-9\\s-]", "");
        slug = slug.replaceAll("\\s+", "-");
        return slug;
    }

    public List<Problem> getAllProblems() {
        return problemRepository.findAll();
    }

    public Problem getProblemBySlug(String slug) {
        return problemRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Problem not found with slug: " + slug));
    }

    @Transactional
    public Problem createProblem(ProblemDTO dto) {
        Problem problem = new Problem();
        problem.setTitle(dto.getTitle());
        problem.setSlug(generateSlug(dto.getTitle()));
        problem.setDescription(dto.getDescription());
        problem.setDifficulty(com.datn.onlinerecruitmentsystem.enums.Difficulty.valueOf(dto.getDifficulty()));
        problem.setCpuTimeLimit(dto.getCpuTimeLimit());
        problem.setMemoryLimitMb(dto.getMemoryLimitMb());
        problem.setTemplateCode(dto.getTemplateCode());

        Problem savedProblem = problemRepository.save(problem);

        if (dto.getTestCases() != null && !dto.getTestCases().isEmpty()) {
            List<TestCase> testCases = dto.getTestCases().stream().map(tcDto -> {
                TestCase tc = new TestCase();
                tc.setInputData(tcDto.getInput());

                tc.setExpectedOutput(tcDto.getOutput());

                tc.setHidden(tcDto.isHidden());

                tc.setProblem(savedProblem);
                return tc;
            }).collect(Collectors.toList());
            testCaseRepository.saveAll(testCases);
        }

        return savedProblem;
    }

    @Transactional
    public Problem updateProblem(Long id, ProblemDTO dto) {
        Problem existingProblem = problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found with id: " + id));

        existingProblem.setTitle(dto.getTitle());
        // existingProblem.setSlug(generateSlug(dto.getTitle())); // Tùy chọn update slug
        existingProblem.setDescription(dto.getDescription());
        existingProblem.setDifficulty(com.datn.onlinerecruitmentsystem.enums.Difficulty.valueOf(dto.getDifficulty()));
        existingProblem.setCpuTimeLimit(dto.getCpuTimeLimit());
        existingProblem.setMemoryLimitMb(dto.getMemoryLimitMb());
        existingProblem.setTemplateCode(dto.getTemplateCode());

        testCaseRepository.deleteAllByProblemId(id);

        if (dto.getTestCases() != null && !dto.getTestCases().isEmpty()) {
            List<TestCase> newTestCases = dto.getTestCases().stream().map(tcDto -> {
                TestCase tc = new TestCase();
                tc.setInputData(tcDto.getInput());
                tc.setExpectedOutput(tcDto.getOutput());
                tc.setHidden(tcDto.isHidden());
                tc.setProblem(existingProblem);
                return tc;
            }).collect(Collectors.toList());

            testCaseRepository.saveAll(newTestCases);
        }

        return problemRepository.save(existingProblem);
    }
}