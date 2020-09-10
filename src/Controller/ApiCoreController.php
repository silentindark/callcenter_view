<?php

namespace App\Controller;

use App\Repository\CallsRepository;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Class ApiCoreController
 * @package App\Controller
 * @Route("/api")
 */
class ApiCoreController extends AbstractController
{

    /**
     * @Route("/calls_list/{date}")
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function call_list($date, CallsRepository $callsRepository, Connection $connection):JsonResponse{

        $data = $callsRepository->calls_list($date);

        return $this->json($data);
    }

    /**
     * @Route("/not_answer_agents/{date}")
     * @param $date
     * @param CallsRepository $callsRepository
     * @return JsonResponse
     */
    public function not_answer_agents($date,CallsRepository $callsRepository):JsonResponse{
        $data = $callsRepository->not_answer($date);
        return $this->json($data);
    }

    /**
     * @Route("/calls_summary/{date}")
     * @param $date
     * @param CallsRepository $callsRepository
     * @return JsonResponse
     */
    public function calls_summary($date,CallsRepository $callsRepository):JsonResponse{
        $data = $callsRepository->calls_summary($date);
        return $this->json($data);
    }

}