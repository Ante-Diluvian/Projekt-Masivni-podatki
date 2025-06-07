import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export function WorkoutChart({ workouts }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || workouts.length === 0) return;

    const sortedWorkouts = [...workouts].sort((a, b) => new Date(a.startTimestamp) - new Date(b.startTimestamp));

    const chartInstance = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: sortedWorkouts.map(w => new Date(w.startTimestamp).toLocaleString()),
        datasets: [{
          label: `Calories Burned`,
          data: sortedWorkouts.map(w => w.caloriesBurned),
          borderColor: 'rgb(75, 192, 192)',
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Workout Calories Over Time`
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Time' }
          },
          y: {
            title: { display: true, text: 'Calories Burned' }
          }
        }
      }
    });

    return () => chartInstance.destroy();
  }, [workouts]);

  return (
    <div className="mt-4" style={{ height: '300px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  );
}

export function LatestChart({ workouts }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || workouts.length === 0) return;

    const lastWorkout = workouts[workouts.length - 1];
    const chartInstance = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: ['Duration (s)', 'Calories Burned', 'Distance (m)'],
        datasets: [{
          label: lastWorkout.name,
          data: [lastWorkout.duration, lastWorkout.caloriesBurned, lastWorkout.distance],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(75, 192, 192, 0.6)'
          ],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Last Workout: ${lastWorkout.name}`
          }
        }
      }
    });

    return () => chartInstance.destroy();
  }, [workouts]);

  return (
    <div className="mt-4" style={{ height: '300px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  );
}

export function SpeedChart({ workout }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !workout?.accelerometer) return;

    const { avgSpeed, maxSpeed } = workout.accelerometer;
    const chartInstance = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: ['Avg Speed (m/s)', 'Max Speed (m/s)'],
        datasets: [{
          data: [avgSpeed, maxSpeed],
          backgroundColor: [
            'rgba(255, 206, 86, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
       options: {
        indexAxis: 'x',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: ``
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: ''
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Speed (m/s)'
            }
          }
        }
      }
    });

    return () => chartInstance.destroy();
  }, [workout]);

  return (
    <div className="mt-4" style={{ height: '300px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  );
}

export function Exercise({ workouts }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || workouts.length === 0) return;

    const workoutCounts = workouts.reduce((acc, workout) => {
      acc[workout.name] = (acc[workout.name] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(workoutCounts);
    const data = Object.values(workoutCounts);

    const chartInstance = new Chart(chartRef.current, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)'
          ],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Most Common Exercises'
          }
        }
      }
    });

    return () => chartInstance.destroy();
  }, [workouts]);

  return (
    <div className="mt-4" style={{ height: '300px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  );
}

export function WorkoutMetricsChart({ workout }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !workout) return;

    const dataValues = [
      workout.duration,
      workout.caloriesBurned,
      workout.distance
    ];
    const labels = ['Duration (s)', 'Calories Burned', 'Distance (m)'];

    const chartInstance = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: workout.name,
          data: dataValues,
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(75, 192, 192, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: ``
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Value'
            }
          },
          x: {
            title: {
              display: true,
              text: ''
            }
          }
        }
      }
    });

    return () => chartInstance.destroy();
  }, [workout]);

  return (
    <div className="mt-4" style={{ height: '300px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  );
}

export function ElevationChart({ workout }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !workout?.gps?.altitude) return;

    const altitudeArray = workout.gps.altitude;
    const labels = altitudeArray.map((_, i) => `Pt ${i + 1}`);

    const chartInstance = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Altitude (m)',
          data: altitudeArray,
          borderColor: 'rgba(255, 159, 64, 0.8)',
          backgroundColor: 'rgba(255, 159, 64, 0.4)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: ``
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'GPS Point Index'
            }
          },
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Altitude (m)'
            }
          }
        }
      }
    });

    return () => chartInstance.destroy();
  }, [workout]);

  return (
    <div className="mt-4" style={{ height: '300px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  );
}