package com.datn.onlinerecruitmentsystem.service;

import com.datn.onlinerecruitmentsystem.dto.SubmissionDTO;
import com.datn.onlinerecruitmentsystem.entity.*;
import com.datn.onlinerecruitmentsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final TestCaseRepository testCaseRepository;

    public Submission submitCode(SubmissionDTO dto) throws Exception {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Problem problem = problemRepository.findById(dto.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        Submission submission = new Submission();
        submission.setUser(user);
        submission.setProblem(problem);
        submission.setSourceCode(dto.getSourceCode());
        submission.setLanguage(dto.getLanguage());
        submission.setStatus("PENDING");
        submissionRepository.save(submission);

        List<TestCase> testCases = testCaseRepository.findByProblemId(problem.getId());
        int passCount = 0;

        Path tempDir = Files.createTempDirectory("submission_" + submission.getId());
        File sourceFile = new File(tempDir.toFile(), "Main.java");
        try (FileWriter writer = new FileWriter(sourceFile)) {
            writer.write(dto.getSourceCode());
        }

        for (TestCase testCase : testCases) {
            String userOutput = runCodeInDocker(tempDir.toAbsolutePath().toString(), testCase.getInputData());

            if (userOutput.trim().equals(testCase.getExpectedOutput().trim())) {
                passCount++;
            } else {
                submission.setStatus("WRONG_ANSWER");
                break;
            }
        }

        if (passCount == testCases.size()) {
            submission.setStatus("ACCEPTED");
        }
        submission.setPassCount(passCount);
        submission.setTotalTestCases(testCases.size());

        sourceFile.delete();
        tempDir.toFile().delete();

        return submissionRepository.save(submission);
    }

    private String runCodeInDocker(String hostPathFolder, String input) {
        try {
            String[] dockerCommand = {
                    "docker", "run", "--rm",
                    "-i",
                    "-v", hostPathFolder + ":/app",
                    "eclipse-temurin:17-jdk-alpine",
                    "sh", "-c",
                    "javac /app/Main.java && java -cp /app Main"
            };

            ProcessBuilder pb = new ProcessBuilder(dockerCommand);
            Process process = pb.start();

            try (OutputStream os = process.getOutputStream()) {
                os.write(input.getBytes());
                os.flush();
            }

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            StringBuilder error = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    error.append(line).append("\n");
                }
            }

            boolean finished = process.waitFor(5, TimeUnit.SECONDS);
            if (!finished) {
                process.destroy();
                return "TIME_LIMIT_EXCEEDED";
            }

            if (process.exitValue() != 0) {
                return "COMPILE_ERROR: " + error.toString();
            }

            return output.toString();

        } catch (Exception e) {
            e.printStackTrace();
            return "SYSTEM_ERROR: " + e.getMessage();
        }
    }
}